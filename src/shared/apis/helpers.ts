export const getInvoiceTypeCode = (invoiceId: string): string | undefined => {
  if (invoiceId.includes('CD')) {
    return 'DebitMemo';
  }

  if (invoiceId.includes('CR')) {
    return 'CreditMemo';
  }
};

export const getTaxTypeCode = (taxCode: string): string => {
  if (taxCode === 'GST') {
    return 'GoodsAndServicesTax';
  }

  return 'StateProvincialTax';
};
