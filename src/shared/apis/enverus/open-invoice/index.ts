import fetch, { Response } from 'node-fetch';
import * as https from 'https';
import * as fs from 'fs';
import * as fxp from 'fast-xml-parser';
const FormData = require('form-data');

import {
  InvoiceStatusEnum,
  InvoiceType,
} from '../../../../modules/invoices/invoices-types';
import { PATH_PFX, PASSPHRASE } from '../../../constants';
import { log, flush } from '../../../logger';
import { handleTryCatch } from '../../../utils';
import { getApiUrl, getInvoiceBodyXML } from './helpers';
import { EnverusInvoiceStatusEnum, FetchStatusResponseType } from './types';

export class EnverusOpenInvoiceAPI {
  _fetchStatus = async (
    environment: string,
    invoiceId: string,
    numberId: string,
  ): Promise<FetchStatusResponseType> => {
    let statusInvoice = '';
    const response = await fetch(
      `${getApiUrl(environment, 'GET')}/${numberId}`,
      {
        method: 'GET',
        agent: new https.Agent({
          pfx: fs.readFileSync(PATH_PFX),
          passphrase: PASSPHRASE,
        }),
        headers: {
          'Content-Type': 'application/xml',
        },
      },
    );

    const textResponseFetchStatus = await response.text();
    const jsonresponseFetchStatus = fxp.parse(textResponseFetchStatus);

    const responseInvoiceId =
      jsonresponseFetchStatus['pidx:InvoiceResponse'][
        'pidx:InvoiceResponseProperties'
      ]['pidx:InvoiceInformation']['pidx:InvoiceNumber'];

    if (invoiceId === responseInvoiceId) {
      log(
        `jsonresponseInvoice selected: ${JSON.stringify(
          jsonresponseFetchStatus,
          null,
          2,
        )}`,
      );
      const lineItems =
        jsonresponseFetchStatus['pidx:InvoiceResponse'][
          'pidx:InvoiceResponseDetails'
        ]['pidx:InvoiceResponseLineItem'];

      let lineItemsStatuses: string[] = [];
      if (Array.isArray(lineItems)) {
        lineItemsStatuses = lineItems.map(
          (li: { 'pidx:LineStatusCode': string }) => li['pidx:LineStatusCode'],
        );
      } else {
        lineItemsStatuses.push(lineItems['pidx:LineStatusCode']);
      }

      if (
        lineItemsStatuses.some((lis) => lis === EnverusInvoiceStatusEnum.reject)
      ) {
        statusInvoice = InvoiceStatusEnum.rejected;
      } else if (
        lineItemsStatuses.every(
          (lis) => lis === EnverusInvoiceStatusEnum.pending,
        )
      ) {
        statusInvoice = InvoiceStatusEnum.submitted;
      } else if (
        lineItemsStatuses.every(
          (lis) => lis === EnverusInvoiceStatusEnum.accept,
        )
      ) {
        statusInvoice = InvoiceStatusEnum.approved;
      }

      return {
        invoiceId: responseInvoiceId,
        enverusInvoiceId: numberId,
        status: statusInvoice,
      };
    }
    return undefined;
  };
  /**
   * Method for fetch invoice status.
   *
   * @param environment - Environment name.
   * @param duns - Buyer duns.
   * @param date - Submitted date.
   * @param invoiceId - Invoice ID.
   * @param enverusInvoiceId - Invoice ID in ENVERUS.
   */
  fetchStatusInvoice = async (
    environment: string,
    duns: string,
    date: string,
    invoiceId: string,
    enverusInvoiceId: string | undefined,
  ): Promise<[Response, undefined] | [undefined, Error]> => {
    let enverusInvoiceNumber = enverusInvoiceId;

    if (!enverusInvoiceNumber) {
      const filter = `buyerDUNS eq ${duns} and status eq 'approved,disputed,paid,received' and lastActionDate eq ${date}`;
      const [result, error] = await handleTryCatch(
        fetch(`${getApiUrl(environment, 'GET')}?$filter=${filter}`, {
          method: 'GET',
          agent: new https.Agent({
            pfx: fs.readFileSync(PATH_PFX),
            passphrase: PASSPHRASE,
          }),
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
        }),
      );

      if (error) {
        log(
          `ERROR fetchStatusInvoice(Enverus): ${
            typeof error === 'string' ? error : JSON.stringify(error)
          }`,
        );
        await flush();
        return [undefined, error];
      }

      const jsonResponse = await result.json();

      log(
        `DEBUG: FECTH INVOICE STATUS IN ENVERUS: ${JSON.stringify(
          jsonResponse,
        )}`,
      );

      if (!jsonResponse.invoices) {
        log('ERROR fetchStatusInvoice(Enverus): Not found invoice id');
        await flush();
        return [undefined, Error('Not found invoice Id')];
      }

      const linkList: { links: { uri: string }[] }[] = jsonResponse.invoices;
      const promises: Promise<FetchStatusResponseType>[] = [];

      for (const link of linkList) {
        const numberId = link.links[0].uri.split('/').pop();
        if (numberId) {
          promises.push(this._fetchStatus(environment, invoiceId, numberId));
        }
      }

      let responseList: FetchStatusResponseType[] = [];
      try {
        responseList = await Promise.all(promises);
        responseList = responseList.filter((rl) => rl);
        log(`DEBUG: RESULTS PROMISES: ${JSON.stringify(responseList)}`);
      } catch (errorResults) {
        log('ERROR results promise.All');
      }

      if (responseList.length) {
        const response = responseList[0];
        return [
          new Response(
            JSON.stringify({
              enverusInvoiceId: response?.enverusInvoiceId as string,
              status: response?.status as string,
            }),
          ),
          undefined,
        ];
      }

      log('ERROR fetchStatusInvoice(Enverus): Not found invoice id');
      await flush();
      return [undefined, Error('Not found invoice Id')];
    } else {
      const response: FetchStatusResponseType = await this._fetchStatus(
        environment,
        invoiceId,
        enverusInvoiceNumber,
      );

      if (response) {
        return [
          new Response(
            JSON.stringify({
              enverusInvoiceId: response?.enverusInvoiceId as string,
              status: response?.status as string,
            }),
          ),
          undefined,
        ];
      }

      log('ERROR fetchStatusInvoice(Enverus): Not found invoice id');
      await flush();
      return [undefined, Error('Not found invoice Id')];
    }
  };

  /**
   * Method to synchronize invoice.
   *
   * @param invoice - Invoice data from 8base DB.
   * @param file - Invoice file from 8base DB (base 64).
   * @param environment - Environment name.
   */
  syncInvoice = async (
    invoice: InvoiceType,
    file: string,
    environment: string,
  ): Promise<[Response, undefined] | [undefined, Error]> => {
    const bodyXML = getInvoiceBodyXML(invoice);

    log(`DEBUG: REQUEST XML: ${bodyXML}`);

    const formData = new FormData();
    formData.append('pidxv10_invoice_xml', bodyXML, {
      contentType: 'application/xml',
    });
    formData.append('Attachment1', Buffer.from(file, 'base64'), {
      contentType: 'application/pdf',
      contentTransferEncoding: 'base64',
    });

    const apiUrl = getApiUrl(environment, 'POST');

    log(`DEBUG: syncInvoice ENVERUS OPEN INVOICE API URL: ${apiUrl}`);

    const [result, error] = await handleTryCatch(
      fetch(apiUrl, {
        method: 'POST',
        agent: new https.Agent({
          pfx: fs.readFileSync(PATH_PFX),
          passphrase: PASSPHRASE,
        }),
        headers: {
          accept: '*/*',
          'content-type': 'multipart/mixed; boundary=' + formData.getBoundary(),
        },
        body: formData,
      }),
    );

    if (error) {
      // console.log(
      //   `ERROR syncInvoice(Enverus): ${
      //     typeof error === 'string' ? error : JSON.stringify(error)
      //   }`,
      // );
      log(
        `ERROR syncInvoice(Enverus open invoice): ${
          typeof error === 'string' ? error : JSON.stringify(error)
        }`,
      );
      await flush();
      return [undefined, error];
    }

    const textResponse = await result.text();
    const jsonResponse = fxp.parse(textResponse);

    if (result.status !== 200) {
      log(
        `ERROR syncInvoice(Enverus open invoice): ${JSON.stringify(
          jsonResponse,
        )}`,
      );
      await flush();

      let msjError = '';

      if (jsonResponse.DOResponse) {
        const errorObject = jsonResponse.DOResponse.Errors.Error;
        if (Array.isArray(errorObject)) msjError = errorObject[0];
        else msjError = errorObject;
      } else {
        msjError = 'Unknown Error';
      }

      return [undefined, Error(msjError)];
    }

    log(
      `DEBUG: syncInvoice ENVERUS OPEN INVOICE API: ${JSON.stringify(
        jsonResponse,
      )}`,
    );

    const syncInvoiceResponseObject = {
      message: 'Invoice synced to Enverus Open Invoice',
      warnings: (jsonResponse.DOResponse?.Warnings?.Warning || []).filter(
        (w: string) => !w.includes('Using default Supplier'),
      ),
    };

    return [new Response(JSON.stringify(syncInvoiceResponseObject)), undefined];
  };
}
