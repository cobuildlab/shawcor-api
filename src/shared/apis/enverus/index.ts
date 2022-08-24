import fetch, { Response } from 'node-fetch';
import * as https from 'https';
import * as fs from 'fs';
import * as fxp from 'fast-xml-parser';
const FormData = require('form-data');

import { handleTryCatch } from '../../utils';
import { log, flush } from '../../logger';
import {
  PATH_ENVERUS_OPEN_INVOICE,
  PATH_PFX,
  PASSPHRASE,
} from '../../constants';
import { InvoiceType } from '../../../modules/invoices/invoices-types';
import { getInvoiceBodyXML } from './helpers';

export class EnverusAPI {
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
      fetch(PATH_ENVERUS_OPEN_INVOICE, {
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
