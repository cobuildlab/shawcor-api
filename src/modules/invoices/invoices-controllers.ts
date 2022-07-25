import { log, flush } from '../../shared/logger';
import { EnverusAPI } from '../../shared/apis/enverus';
import { expressAsyncWrapper } from '../../shared/utils';
import { InvoiceType } from './invoices-types';

export const syncInvoiceToEnverus = expressAsyncWrapper(
  async (request, response) => {
    log(
      `syncInvoiceToEnverus request body: ${JSON.stringify(
        request.body,
        null,
        2,
      )}`,
    );

    const invoice: InvoiceType = JSON.parse(request.body.invoice);

    const clientEnverus = new EnverusAPI();
    await clientEnverus.syncInvoice(invoice);

    await flush();
    return response.status(200).json({ message: 'Invoice synced to Enverus' });
  },
);

export const statusApi = expressAsyncWrapper(async (request, response) => {
  return response.status(200).json({
    message: 'Invoice status API: OK',
  });
});
