import { log, flush } from '../../shared/logger';
import { expressAsyncWrapper } from '../../shared/utils';
import { InvoiceBody } from './invoices-types';
import { fetchStatusInvoiceFromApi, syncInvoiceToApi } from '../../shared/apis';
import { FetchStatusBody } from '../../shared/apis/types';

export const syncInvoice = expressAsyncWrapper(async (request, response) => {
  log(`syncInvoiceToEnverus: ${JSON.stringify(request.body, null, 2)}`);

  const { invoice, file, environment }: InvoiceBody = request.body;
  const [responseSync, error] = await syncInvoiceToApi(
    invoice,
    file,
    environment,
  );

  if (error) {
    return response.status(400).json({ message: error.message });
  }

  if (responseSync === undefined) {
    return response.status(400).json({ message: 'Empty response' });
  }

  log(`responseSync: ${JSON.stringify(responseSync, null, 2)}`);

  await flush();

  return response.status(200).json({ message: 'Invoice synced to Enverus' });
});

export const statusInvoice = expressAsyncWrapper(async (request, response) => {
  log(`statusInvoice query params: ${JSON.stringify(request.query, null, 2)}`);

  const paramFilter = request.query as FetchStatusBody;
  const { nameApi, dunsBuyer, submittedDate, invoiceId } = paramFilter;

  if (!nameApi) {
    return response.status(400).json({ message: 'require nameApi' });
  }

  if (!invoiceId) {
    return response.status(400).json({ message: 'require invoiceId' });
  }

  if (!submittedDate) {
    return response.status(400).json({ message: 'require submittedDate' });
  }

  if (!dunsBuyer) {
    return response.status(400).json({ message: 'require dunsBuyer' });
  }

  const [responseStatus, error] = await fetchStatusInvoiceFromApi(
    nameApi,
    paramFilter,
  );

  await flush();

  if (error) {
    return response.status(400).json({ message: error.message });
  }

  if (responseStatus === undefined) {
    return response.status(400).json({ message: 'Empty response' });
  }

  return response
    .status(200)
    .json({ message: 'Fetch status', ...responseStatus });
});

export const statusApi = expressAsyncWrapper(async (request, response) => {
  return response.status(200).json({
    message: 'Invoice status API: OK',
  });
});
