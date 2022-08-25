import { log, flush } from '../../shared/logger';
import { EnverusAPI } from '../../shared/apis/enverus';
import { expressAsyncWrapper, fetchFileByUrl } from '../../shared/utils';
import { FetchStatusBody, InvoiceBody } from './invoices-types';

export const syncInvoiceToEnverus = expressAsyncWrapper(
  async (request, response) => {
    log(`syncInvoiceToEnverus: ${JSON.stringify(request.body, null, 2)}`);

    const { invoice, file }: InvoiceBody = request.body;

    const fileResponse = await fetchFileByUrl(file);
    // ENCODE TO BASE 64
    const fileBase64 = (await fileResponse.buffer()).toString('base64');

    const clientEnverus = new EnverusAPI();
    const [, error] = await clientEnverus.syncInvoice(invoice, fileBase64);

    await flush();

    if (error) {
      return response.status(400).json({ message: error.message });
    }
    return response.status(200).json({ message: 'Invoice synced to Enverus' });
  },
);

export const statusInvoice = expressAsyncWrapper(async (request, response) => {
  log(`statusInvoice query params: ${JSON.stringify(request.query, null, 2)}`);

  const { dunsBuyer, submittedDate, invoiceId } =
    request.query as FetchStatusBody;

  const clientEnverus = new EnverusAPI();
  const [statusInvoiceResponse, error] = await clientEnverus.fetchStatusInvoice(
    dunsBuyer,
    submittedDate,
    invoiceId,
  );

  await flush();

  if (error) {
    return response.status(400).json({ message: error.message });
  }
  return response
    .status(200)
    .json({ message: 'Fetch status', ...statusInvoiceResponse });
});

export const statusApi = expressAsyncWrapper(async (request, response) => {
  return response.status(200).json({
    message: 'Invoice status API: OK',
  });
});
