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

export type InvoiceStatusType =
  | 'approved'
  | 'rejected'
  | 'submitted'
  | 'unsubmitted'
  | 'paid';

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
};

export type InvoiceBody = {
  invoice: InvoiceType;
  file: string;
};

export type FetchStatusBody = {
  dunsBuyer: string;
  submittedDate: string;
  invoiceId?: string;
};

export type FetchStatusInvoiceResponse = {
  invoiceId: string;
  status: string;
};
