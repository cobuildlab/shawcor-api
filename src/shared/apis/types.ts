/* eslint-disable no-unused-vars */
// API Names in 8base
export enum ApiNameEnum {
  Jobutrax = 'JOBUTRAX',
  Actian = 'ACTIAN',
  EnverusOpenInvoice = 'ENVERUS OPEN INVOICE',
  EnverusCortex = 'ENVERUS CORTEX',
}

export type FetchStatusBody = {
  dunsBuyer: string;
  submittedDate: string;
  invoiceId: string;
  enverusInvoiceId?: string;
};

export type FetchStatusInvoiceResponse = {
  enverusInvoiceId: string;
  status: string;
};
