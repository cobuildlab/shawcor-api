/* eslint-disable no-unused-vars */
import { AddressType, EntityBaseType } from '../../shared/types';

export type CustomerType = EntityBaseType & {
  customerId: string;
  customerNo: string;
  name: string;
  email: string;
  phone: string;
  addresses: {
    items: Array<AddressType>;
  };
  customerInvoicesRelation: {
    items: Array<InvoiceType>;
    count: number;
  };
  duns?: number;
  site?: string;
  archivedAt: string | null;
  approvedInvoices?: { count: number };
  rejectedInvoices?: { count: number };
  submittedInvoices?: { count: number };
  paidInvoices?: { count: number };
};

export enum InvoiceStatusEnum {
  approved = 'approved',
  rejected = 'rejected',
  submitted = 'submitted',
  unsubmitted = 'unsubmitted',
  paid = 'paid',
}

export type InvoiceStatusType = `${InvoiceStatusEnum}`;

export type InvoiceTaxLineType = EntityBaseType & {
  taxAmount: number;
  taxCode: string;
  taxId: number;
  taxPercentage: number;
};

export type InvoiceLineType = EntityBaseType & {
  itemNo: string;
  description: string;
  uom: string;
  quantity: number;
  unitPrice: number;
  total: number;
  taxLinesRelation?: {
    items: Array<InvoiceTaxLineType>;
  };
};

export type InvoiceType = EntityBaseType & {
  customer: CustomerType;
  invoiceId: string;
  invoiceDate: string;
  status: InvoiceStatusType;
  tax: number;
  taxType: string;
  total: number;
  subTotal: number;
  currency: string;
  rig: string;
  orderNo: string;
  payTerm: string;
  oilCompany: string;
  wellLocation: string;
  workLocation: string;
  syncWith: string;
  invoiceLinesRelation?: {
    items: Array<InvoiceLineType>;
    count: number;
  };
  archivedAt: string | null;
  costCenter: string;
  majorMinor: string;
  approverCode: string;
  approver: string;
  afe: string;
  ticket: string;
  purchaseOrder: string;
  priceBook: string;
};

export type InvoiceBody = {
  invoice: InvoiceType;
  file: string;
  environment: string;
};

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
