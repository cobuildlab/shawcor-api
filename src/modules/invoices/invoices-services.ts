import { Response } from 'node-fetch';
import { fetchStatusInvoiceFromApi, syncInvoiceToApi } from '../../shared/apis';
import { FetchStatusBody } from '../../shared/apis/types';
import { InvoiceBody, StatusInvoiceServiceResponse } from './invoices-types';
import { validateParamFilter } from './invoices-validator';

export const fetchStatusInvoice = async (
  paramFilter: FetchStatusBody,
): StatusInvoiceServiceResponse => {
  const errors = await validateParamFilter(paramFilter);

  if (errors.length) {
    const bodyResponse = {
      message: 'Query params error',
      errors,
    };
    let response = new Response(JSON.stringify(bodyResponse), { status: 400 });
    return [response, undefined];
  }

  return await fetchStatusInvoiceFromApi(paramFilter);
};

export const syncInvoice = async (invoiceBody: InvoiceBody) => {
  const { invoice, file, environment } = invoiceBody;
  return await syncInvoiceToApi(invoice, file, environment);
};
