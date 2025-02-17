import { Response } from 'node-fetch';
import { InvoiceType } from '../../modules/invoices/invoices-types';
import { fetchFileByUrl } from '../utils';
import { EnverusCortexAPI } from './enverus/cortex';
import { EnverusOpenInvoiceAPI } from './enverus/open-invoice';
import {
  ApiNameEnum,
  FetchStatusBody,
  StatusInvoiceResponseType,
} from './types';

export const fetchStatusInvoiceFromApi = async (
  paramsFilter: FetchStatusBody,
): Promise<StatusInvoiceResponseType> => {
  const { nameApi } = paramsFilter;

  if (ApiNameEnum.EnverusCortex === nameApi) {
    return [undefined, undefined];
  } else if (ApiNameEnum.EnverusOpenInvoice === nameApi) {
    const {
      dunsBuyer,
      environment,
      submittedDate,
      invoiceId,
      enverusInvoiceId,
    } = paramsFilter;

    const clientEnverus = new EnverusOpenInvoiceAPI();
    const [statusInvoiceResponse, error] =
      await clientEnverus.fetchStatusInvoice(
        environment,
        dunsBuyer,
        submittedDate,
        invoiceId,
        enverusInvoiceId,
      );

    if (error) return [undefined, error];
    return [statusInvoiceResponse, undefined];
  }

  return [undefined, undefined];
};

export const syncInvoiceToApi = async (
  invoice: InvoiceType,
  file: string,
  environment: string,
): Promise<
  [Response, undefined] | [undefined, Error] | [undefined, undefined]
> => {
  const nameApi = invoice.portalSync;
  if (ApiNameEnum.EnverusCortex === nameApi) {
    const clientEnverusCortex = new EnverusCortexAPI();
    const [response, error] = await clientEnverusCortex.syncInvoice(
      invoice,
      environment,
    );
    if (error) return [undefined, error];
    return [response, undefined];
  } else if (ApiNameEnum.EnverusOpenInvoice === nameApi) {
    const fileResponse = await fetchFileByUrl(file);
    // ENCODE TO BASE 64
    const fileBase64 = (await fileResponse.buffer()).toString('base64');

    const clientEnverusOpenInvoice = new EnverusOpenInvoiceAPI();
    const [response, error] = await clientEnverusOpenInvoice.syncInvoice(
      invoice,
      fileBase64,
      environment,
    );

    if (error) return [undefined, error];
    return [response, undefined];
  }

  return [undefined, undefined];
};
