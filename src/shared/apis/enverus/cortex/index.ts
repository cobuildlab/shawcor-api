import fetch, { Response } from 'node-fetch';
import * as fxp from 'fast-xml-parser';

import { InvoiceType } from '../../../../modules/invoices/invoices-types';
import { log, flush } from '../../../logger';
import { handleTryCatch } from '../../../utils';
import { getApiUrl, getInvoiceBodyXML } from './helpers';
import {
  PASSWORD_CREDENTIALS_CORTEX,
  USERNAME_CREDENTIALS_CORTEX,
} from '../../../constants';

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
        headers: {
          'Content-Type': 'application/xml',
          Username: USERNAME_CREDENTIALS_CORTEX,
          Password: PASSWORD_CREDENTIALS_CORTEX,
        },
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
      log(`ERROR syncInvoice(Enverus cortex): ${JSON.stringify(jsonResponse)}`);
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
      `DEBUG: syncInvoice ENVERUS CORTEX API: ${JSON.stringify(jsonResponse)}`,
    );

    const syncInvoiceResponseObject = {
      message: 'Invoice synced to Enverus Cortex',
    };

    return [new Response(JSON.stringify(syncInvoiceResponseObject)), undefined];
  };
}
