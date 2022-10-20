/* eslint-disable no-unused-vars */

export enum EnverusInvoiceStatusEnum {
  accept = 'Accept',
  reject = 'Reject',
  pending = 'Pending',
}

export type FetchStatusResponseType =
  | {
      invoiceId: string;
      enverusInvoiceId: string;
      status: string;
    }
  | undefined;
