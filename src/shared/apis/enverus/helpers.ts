import { InvoiceType } from '../../../modules/invoices/invoices-types';

/**
 * To generate request body to synchronize invoice.
 *
 * @param invoice - Invoice data from 8base DB.
 * @returns - Request body content, in XML format.
 */
export const getInvoiceBodyXML = (invoice: InvoiceType): string => {
  const invoiceBody = `
    <?xml version="1.0" encoding="utf-8"?>
    <pidx:Invoice xmlns:pidx="http://www.api.org/pidXML/v1.0"
                  pidx:transactionPurposeIndicator="Original"
                  pidx:version="1.0">
      <pidx:InvoiceProperties>
        <pidx:InvoiceNumber>${invoice.invoiceId}</pidx:InvoiceNumber>
        <pidx:InvoiceDate>${invoice.invoiceDate}</pidx:InvoiceDate>
        <pidx:PartnerInformation partnerRoleIndicator="Seller">
          <pidx:PartnerIdentifier partnerIdentifierIndicator="DUNSNumber">249054263</pidx:PartnerIdentifier>
        </pidx:PartnerInformation>
        <pidx:PartnerInformation partnerRoleIndicator="BillTo">
          <pidx:PartnerIdentifier partnerIdentifierIndicator="DUNSNumber">${
  invoice.customer.duns
}</pidx:PartnerIdentifier>
        </pidx:PartnerInformation>
        ${
  invoice.currency &&
          `
          <pidx:PrimaryCurrency>
            <pidx:CurrencyCode>${invoice.currency}</pidx:CurrencyCode>
          </pidx:PrimaryCurrency>
          `
}
        
        <pidx:JobLocationInformation>
          <pidx:JobLocationIdentifier>${
  invoice.workLocation
}</pidx:JobLocationIdentifier>
          ${
  invoice.wellLocation &&
            `
            <pidx:WellInformation>
              <pidx:WellIdentifier>${invoice.wellLocation}</pidx:WellIdentifier>
            </pidx:WellInformation>
            `
}
        </pidx:JobLocationInformation>
        <pidx:Attachment>
          <pidx:AttachmentPurposeCode>Template</pidx:AttachmentPurposeCode>
          <pidx:FileName>${invoice.invoiceId}.pdf</pidx:FileName>
          <pidx:FileType>application/pdf</pidx:FileType>
        </pidx:Attachment>
      </pidx:InvoiceProperties>

      <pidx:InvoiceSummary>
        <pidx:TotalLineItems>${
  (invoice.invoiceLinesRelation?.items || []).length
}</pidx:TotalLineItems>
        <pidx:InvoiceTotal>${invoice.total}</pidx:InvoiceTotal>
        <pidx:SubTotalAmount>
          <pidx:MonetaryAmount subTotalIndicator="Equipment">${
  invoice.subTotal
}</pidx:MonetaryAmount>
        </pidx:SubTotalAmount>
        <pidx:Tax>
          <pidx:TaxTypeCode>GoodsAndServicesTax</pidx:TaxTypeCode>
          <pidx:TaxRate>5.00</pidx:TaxRate>
          <pidx:TaxAmount>
            <pidx:MonetaryAmount>${invoice.tax}</pidx:MonetaryAmount>
          </pidx:TaxAmount>          
        </pidx:Tax>
      </pidx:InvoiceSummary>

      ${
  invoice.invoiceLinesRelation?.items !== undefined &&
        invoice.invoiceLinesRelation?.items.length > 0 &&
        `
        <pidx:InvoiceDetails>
          ${invoice.invoiceLinesRelation?.items
    .map((lineItem) => {
      return `
              <pidx:InvoiceLineItem>
                <pidx:LineItemNumber>${lineItem.itemNo}</pidx:LineItemNumber>
                <pidx:InvoiceQuantity>
                  <pidx:Quantity>${lineItem.quantity}</pidx:Quantity>
                  <pidx:UnitOfMeasureCode>${lineItem.uom}</pidx:UnitOfMeasureCode>
                </pidx:InvoiceQuantity>
                <pidx:LineItemInformation>
                  <pidx:LineItemDescription>${lineItem.description}</pidx:LineItemDescription>
                </pidx:LineItemInformation>
                <pidx:FieldTicketInformation>
                  <pidx:FieldTicketNumber>${invoice.invoiceId}</pidx:FieldTicketNumber>
                  <pidx:FieldTicketDate>2022-05-30</pidx:FieldTicketDate>
                </pidx:FieldTicketInformation>
                <pidx:Pricing>
                  <pidx:UnitPrice>
                    <pidx:MonetaryAmount>${lineItem.unitPrice}</pidx:MonetaryAmount>
                    <pidx:UnitOfMeasureCode>${lineItem.uom}</pidx:UnitOfMeasureCode>
                  </pidx:UnitPrice>
                </pidx:Pricing>
                <pidx:Tax>
                  <pidx:TaxTypeCode>GoodsAndServicesTax</pidx:TaxTypeCode>
                  <pidx:TaxRate>5.00</pidx:TaxRate>
                </pidx:Tax>
                <pidx:LineItemTotal>
                  <pidx:MonetaryAmount>${lineItem.total}</pidx:MonetaryAmount>
                </pidx:LineItemTotal>
                <pidx:ReferenceInformation referenceInformationIndicator="AFENumber">
                  <pidx:ReferenceNumber>${invoice.afe}</pidx:ReferenceNumber>
                </pidx:ReferenceInformation>
                <pidx:ReferenceInformation referenceInformationIndicator="CostCenter">
                    <pidx:ReferenceNumber>${invoice.costCenter}</pidx:ReferenceNumber>
                </pidx:ReferenceInformation>
              </pidx:InvoiceLineItem>
              `;
    })
    .join('')}
        </pidx:InvoiceDetails>
        `
}
    </pidx:Invoice>
  `;
  return invoiceBody;
};
