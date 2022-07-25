import { AddressType, EntityBaseType } from '../../shared/types';

export type CustomerType = EntityBaseType & {
  customerId: string;
  customerNo: string;
  customerPO: string;
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

export type InvoiceLineType = EntityBaseType & {
  itemNo: string;
  description: string;
  uom: string;
  quantity: number;
  unitPrice: number;
  total: number;
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
  invoiceJSON: any;
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
};
