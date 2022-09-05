import fetch, { Response } from 'node-fetch';
import * as https from 'https';
import * as fs from 'fs';
import * as fxp from 'fast-xml-parser';
const FormData = require('form-data');

import { handleTryCatch } from '../../utils';
import { log, flush } from '../../logger';
import {
  PATH_GET_INVOICE_RESPONSE_OPEN_INVOICE,
  PATH_POST_INVOICE_OPEN_INVOICE,
  PATH_PFX,
  PASSPHRASE,
} from '../../constants';
import {
  FetchStatusInvoiceResponse,
  InvoiceType,
} from '../../../modules/invoices/invoices-types';
import { getInvoiceBodyXML } from './helpers';

type FetchStatusResponseType =
  | {
      invoiceId: string;
      enverusInvoiceId: string;
      status: string;
    }
  | undefined;

export class EnverusAPI {
  _fetchStatus = async (
    invoiceId: string,
    numberId: string,
  ): Promise<FetchStatusResponseType> => {
    let statusInvoice = '';
    const response = await fetch(
      `${PATH_GET_INVOICE_RESPONSE_OPEN_INVOICE}/${numberId}`,
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

      if (lineItemsStatuses.some((lis) => lis === 'Reject'))
        statusInvoice = 'Reject';
      else if (lineItemsStatuses.every((lis) => lis === 'Pending'))
        statusInvoice = 'Pending';

      return {
        invoiceId: responseInvoiceId,
        enverusInvoiceId: numberId,
        status: statusInvoice,
      };
    }
    return;
  };
  /**
   * Method for fetch invoice status.
   *
   * @param duns - Buyer duns.
   * @param date - Submitted date.
   * @param invoiceId - Invoice ID.
   * @param enverusInvoiceId - Invoice ID in ENVERUS.
   */
  fetchStatusInvoice = async (
    duns: string,
    date: string,
    invoiceId: string,
    enverusInvoiceId: string | undefined,
  ): Promise<[FetchStatusInvoiceResponse, undefined] | [undefined, Error]> => {
    let statusInvoice = '';
    let enverusInvoiceNumber = enverusInvoiceId;

    if (!enverusInvoiceNumber) {
      const filter = `buyerDUNS eq ${duns} and status eq 'approved,disputed,paid,received' and lastActionDate eq ${date}`;
      const [result, error] = await handleTryCatch(
        fetch(`${PATH_GET_INVOICE_RESPONSE_OPEN_INVOICE}?$filter=${filter}`, {
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
          promises.push(this._fetchStatus(invoiceId, numberId));
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
          {
            enverusInvoiceId: response?.enverusInvoiceId as string,
            status: response?.status as string,
          },
          undefined,
        ];
      }

      log('ERROR fetchStatusInvoice(Enverus): Not found invoice id');
      await flush();
      return [undefined, Error('Not found invoice Id')];
    } else {
      const [responseInvoice, errorInvoice] = await handleTryCatch(
        fetch(
          `${PATH_GET_INVOICE_RESPONSE_OPEN_INVOICE}/${enverusInvoiceNumber}`,
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
        ),
      );

      if (errorInvoice) {
        log(
          `ERROR fetchStatusInvoice(Enverus): ${
            typeof errorInvoice === 'string'
              ? errorInvoice
              : JSON.stringify(errorInvoice)
          }`,
        );
        await flush();
        return [undefined, errorInvoice];
      }

      const textResponseInvoice = await responseInvoice.text();
      const jsonresponseInvoice = fxp.parse(textResponseInvoice);

      log(
        `jsonresponseInvoice: ${JSON.stringify(jsonresponseInvoice, null, 2)}`,
      );

      const lineItems =
        jsonresponseInvoice['pidx:InvoiceResponse'][
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

      if (lineItemsStatuses.some((lis) => lis === 'Reject'))
        statusInvoice = 'Reject';

      return [
        {
          enverusInvoiceId: enverusInvoiceNumber,
          status: statusInvoice,
        },
        undefined,
      ];
    }
  };

  /**
   * Method to synchronize invoice.
   *
   * @param invoice - Invoice data from 8base DB.
   * @param file - Invoice file from 8base DB (base 64).
   */
  syncInvoice = async (
    invoice: InvoiceType,
    file: string,
  ): Promise<[Response, undefined] | [undefined, Error]> => {
    const bodyXML = getInvoiceBodyXML(invoice);

    log(`DEBUG: REQUEST XML: ${bodyXML}`);
    // console.log(`DEBUG: REQUEST XML: ${bodyXML}`);

    const formData = new FormData();
    formData.append('pidxv10_invoice_xml', bodyXML, {
      contentType: 'application/xml',
    });
    formData.append('Attachment1', Buffer.from(file, 'base64'), {
      contentType: 'application/pdf',
      contentTransferEncoding: 'base64',
    });

    const [result, error] = await handleTryCatch(
      fetch(PATH_POST_INVOICE_OPEN_INVOICE, {
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
        `ERROR syncInvoice(Enverus): ${
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
        `ERROR syncInvoice(Enverus): ${JSON.stringify(
          jsonResponse.DOResponse,
        )}`,
      );
      await flush();
      // throw new Error(
      //   `Error syncInvoice(Enverus): ${JSON.stringify(
      //     jsonResponse.DOResponse,
      //   )}`,
      // );
      let msjError = '';
      const errorObject = jsonResponse.DOResponse.Errors.Error;
      if (Array.isArray(errorObject)) msjError = errorObject[0];
      else msjError = errorObject;
      return [undefined, Error(msjError)];
    }

    log(
      `DEBUG: SYNC INVOICE IN ENVERUS: ${
        (JSON.stringify(jsonResponse.DOResponse), null, 2)
      }`,
    );

    return [result, undefined];
  };
}
