import { log, flush } from '../../shared/logger';
import expressAsyncWrapper from '../../shared/utils';

export const syncInvoiceToEnverus = expressAsyncWrapper(
  async (request, response) => {
    console.log('request.body', JSON.stringify(request.body, null, 2));
    log(
      `syncInvoiceToEnverus request.body: ${JSON.stringify(
        request.body,
        null,
        2,
      )}`,
    );

    await flush();
    return response.status(200).json({ message: 'Invoice synced to Enverus' });
  },
);

export const statusApi = expressAsyncWrapper(async (request, response) => {
  return response.status(200).json({
    message: 'Invoice status API: OK',
  });
});
