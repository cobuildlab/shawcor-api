import { log, flush } from '../../shared/logger';
import { EnverusAPI } from '../../shared/apis/enverus';
import { expressAsyncWrapper, fetchFileByUrl } from '../../shared/utils';
import { InvoiceBody } from './invoices-types';

export const syncInvoiceToEnverus = expressAsyncWrapper(
  async (request, response) => {
    log(
      `syncInvoiceToEnverus invoice: ${JSON.stringify(request.body, null, 2)}`,
    );

    const { invoice, file }: InvoiceBody = request.body;

    const fileResponse = await fetchFileByUrl(file);
    // ENCODE TO BASE 64
    const fileBase64 = (await fileResponse.buffer()).toString('base64');

    const clientEnverus = new EnverusAPI();
    await clientEnverus.syncInvoice(invoice, fileBase64);

    await flush();
    return response.status(200).json({ message: 'Invoice synced to Enverus' });
  },
);

export const statusApi = expressAsyncWrapper(async (request, response) => {
  return response.status(200).json({
    message: 'Invoice status API: OK',
  });
});
