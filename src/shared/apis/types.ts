/* eslint-disable no-unused-vars */

import { Response } from 'node-fetch';

// API Names in 8base
export enum ApiNameEnum {
  Jobutrax = 'JOBUTRAX',
  Actian = 'ACTIAN',
  EnverusOpenInvoice = 'ENVERUS OPEN INVOICE',
  EnverusCortex = 'ENVERUS CORTEX',
}

export type FetchStatusBody = {
  environment: string;
  nameApi: `${ApiNameEnum}`;
  dunsBuyer: string;
  submittedDate: string;
  invoiceId: string;
  enverusInvoiceId?: string;
};

export type StatusInvoiceResponseType =
  | [Response, undefined]
  | [undefined, Error]
  | [undefined, undefined];
