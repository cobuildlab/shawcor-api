import { log, flush } from '../../shared/logger';
import { EnverusAPI } from '../../shared/apis/enverus';
import { expressAsyncWrapper } from '../../shared/utils';
import { InvoiceBody } from './invoices-types';

export const syncInvoiceToEnverus = expressAsyncWrapper(
  async (request, response) => {
    const { invoice, file }: InvoiceBody = request.body;

    log(`syncInvoiceToEnverus invoice: ${JSON.stringify(invoice, null, 2)}`);

    const clientEnverus = new EnverusAPI();
    await clientEnverus.syncInvoice(invoice, file);

    await flush();
    return response.status(200).json({ message: 'Invoice synced to Enverus' });
  },
);

export const statusApi = expressAsyncWrapper(async (request, response) => {
  return response.status(200).json({
    message: 'Invoice status API: OK',
  });
});
