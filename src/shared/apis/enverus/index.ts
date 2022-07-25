import fetch from 'node-fetch';
import * as https from 'https';
import * as fs from 'fs';

import { handleTryCatch } from '../../utils';
import { log, flush } from '../../logger';
import { InvoiceType } from '../../../modules/invoices/invoices-types';
import { getInvoiceBodyXML } from './helpers';

export class EnverusAPI {
  /**
   * Method to synchronize invoice.
   *
   * @param invoice - Invoice data from 8base DB.
   */
  syncInvoice = async (invoice: InvoiceType): Promise<void> => {
    const [result, error] = await handleTryCatch(
      fetch(
        'https://onboard-api.openinvoice.com/docp/supply-chain/v1/invoices/invoice.submit',
        {
          method: 'POST',
          agent: new https.Agent({
            pfx: fs.readFileSync('pskeystore.p12'),
            passphrase: 'shawcor',
          }),
          headers: {
            accept: 'application/json',
            'content-type': 'application/xml',
          },
          body: getInvoiceBodyXML(invoice),
        },
      ),
    );

    if (error) {
      log(
        `ERROR syncInvoice(Enverus): ${
          typeof error === 'string' ? error : JSON.stringify(error)
        }`,
      );
      await flush();
      throw new Error(
        `Error syncInvoice(Enverus): ${
          typeof error === 'string' ? error : JSON.stringify(error)
        }`,
      );
    }

    // const data = await result.json();

    log(`DEBUG: SYNC INVOICE IN ENVERUS: ${JSON.stringify(result, null, 2)}`);
  };
}
