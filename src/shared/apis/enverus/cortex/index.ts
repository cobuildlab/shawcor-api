import fetch, { Response } from 'node-fetch';
import * as fxp from 'fast-xml-parser';

import { InvoiceType } from '../../../../modules/invoices/invoices-types';
import { log, flush } from '../../../logger';
import { handleTryCatch } from '../../../utils';
import { getApiUrl, getInvoiceBodyXML } from './helpers';

export class EnverusCortexAPI {
  /**
   * Method to synchronize invoice.
   *
   * @param invoice - Invoice data from 8base DB.
   * @param environment - Environment name.
   */
  syncInvoice = async (
    invoice: InvoiceType,
    environment: string,
  ): Promise<[Response, undefined] | [undefined, Error]> => {
    const bodyXML = getInvoiceBodyXML(invoice);

    log(`DEBUG: REQUEST XML: ${bodyXML}`);
    // console.log(`DEBUG: REQUEST XML: ${bodyXML}`);

    const [result, error] = await handleTryCatch(
      fetch(`${getApiUrl(environment)}/${invoice.invoiceId}.xml`, {
        method: 'POST',
        body: bodyXML,
      }),
    );

    if (error) {
      // console.log(
      //   `ERROR syncInvoice(Enverus): ${
      //     typeof error === 'string' ? error : JSON.stringify(error)
      //   }`,
      // );
      log(
        `ERROR syncInvoice(Enverus cortex): ${
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
        `ERROR syncInvoice(Enverus cortex): ${JSON.stringify(
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
      `DEBUG: SYNC INVOICE IN ENVERUS CORTEX: ${
        (JSON.stringify(jsonResponse.DOResponse), null, 2)
      }`,
    );

    return [result, undefined];
  };
}
