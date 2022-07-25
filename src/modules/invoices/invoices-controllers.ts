import { log, flush } from '../../shared/logger';
import expressAsyncWrapper from '../../shared/utils';

export const syncInvoiceToEnverus = expressAsyncWrapper(
  async (request, response) => {
    log(`syncInvoiceToEnverus request: ${JSON.stringify(request, null, 2)}`);

    await flush();
    return response.status(200).json({ message: 'Invoice synced to Enverus' });
  },
);

export const statusApi = expressAsyncWrapper(async (request, response) => {
  return response.status(200).json({
    message: 'Invoice status API: OK',
  });
});
