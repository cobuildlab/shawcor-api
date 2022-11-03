import { log, flush } from '../../shared/logger';
import { expressAsyncWrapper } from '../../shared/utils';
import { FetchStatusBody } from '../../shared/apis/types';
import { fetchStatusInvoice, syncInvoice } from './invoices-services';

export const syncInvoiceController = expressAsyncWrapper(
  async (request, response) => {
    log(`syncInvoiceController body: ${JSON.stringify(request.body, null, 2)}`);

    const [responseSync, error] = await syncInvoice(request.body);

    if (error) {
      return response.status(400).json({ message: error.message });
    }

    if (responseSync === undefined) {
      return response.status(400).json({ message: 'Empty response' });
    }

    const jsonResponse = await responseSync.json();

    log(
      `response syncInvoiceController: ${JSON.stringify(
        jsonResponse,
        null,
        2,
      )}`,
    );
    await flush();

    return response.status(200).json(jsonResponse);
  },
);

export const statusInvoiceController = expressAsyncWrapper(
  async (request, response) => {
    log(
      `statusInvoiceController query params: ${JSON.stringify(
        request.query,
        null,
        2,
      )}`,
    );

    const [responseStatus, error] = await fetchStatusInvoice(
      request.query as FetchStatusBody,
    );

    if (error) {
      return response.status(400).json({ message: error.message });
    }

    if (responseStatus === undefined) {
      return response.status(400).json({ message: 'Empty response' });
    }

    const jsonResponse = await responseStatus.json();

    log(
      `response statusInvoiceController: ${JSON.stringify(
        jsonResponse,
        null,
        2,
      )}`,
    );
    await flush();

    return response
      .status(responseStatus.status)
      .json({ message: 'Fetch status', ...jsonResponse });
  },
);

export const statusApi = expressAsyncWrapper(async (request, response) => {
  return response.status(200).json({
    message: 'Invoice status API: OK',
  });
});
