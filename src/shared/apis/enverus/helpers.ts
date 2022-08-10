import { InvoiceType } from '../../../modules/invoices/invoices-types';

const getSite = (site: string | undefined): string => {
  console.log('DEBUG: site: ', site);
  return 'Tundra - Calgary';
};

const getTaxTypeCode = (taxCode: string): string => {
  if (taxCode === 'GST') {
    return 'GoodsAndServicesTax';
  }

  return 'StateProvincialTax';
};

/**
 * To generate request body to synchronize invoice.
 *
 * @param invoice - Invoice data from 8base DB.
 * @returns - Request body content, in XML format.
 */
export const getInvoiceBodyXML = (invoice: InvoiceType): string => {
  const invoiceBody = `<?xml version="1.0" encoding="UTF-8" ?>
    <pidx:Invoice pidx:transactionPurposeIndicator="Original" pidx:version="1.0" xmlns:pidx="http://www.api.org/pidXML/v1.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.api.org/pidXML/v1.0 http://banff.digitaloilfield.com/XML/OI-PIDX-Invoice.xsd">
        <pidx:InvoiceProperties>
            <pidx:InvoiceNumber>${invoice.invoiceId}</pidx:InvoiceNumber>
            <pidx:InvoiceDate>${invoice.invoiceDate}</pidx:InvoiceDate>
            <!-- BUYER information -->
            <pidx:PartnerInformation partnerRoleIndicator="BillTo">
                <pidx:PartnerIdentifier partnerIdentifierIndicator="DUNSNumber">${
  invoice.customer.duns
}</pidx:PartnerIdentifier>
                <pidx:ContactInformation contactInformationIndicator="BuyerDepartment">
                    <pidx:ContactName>${getSite(
    invoice.customer.site,
  )}</pidx:ContactName>
                </pidx:ContactInformation>
            </pidx:PartnerInformation>
            <!-- SUPPLIER information -->
            <pidx:PartnerInformation partnerRoleIndicator="RemitTo">
                <pidx:PartnerIdentifier partnerIdentifierIndicator="DUNSNumber">249054263</pidx:PartnerIdentifier>
            </pidx:PartnerInformation>
            <!--Required for OpenInvoice-->
            <pidx:PrimaryCurrency>
                <pidx:CurrencyCode>${invoice.currency}</pidx:CurrencyCode>
            </pidx:PrimaryCurrency>
            <!--Optional for OpenInvoice, may be required by the buyer-->
            <pidx:JobLocationInformation>
                <pidx:WellInformation>
                    <pidx:WellIdentifier>${
  invoice.wellLocation
}</pidx:WellIdentifier>
                </pidx:WellInformation>
            </pidx:JobLocationInformation>
    
            <!--Optional for OpenInvoice, may be required by the buyer-->
            <!--ReferenceInformation at the header (as well as PO, Field Ticket, Location and Service Datetime) will be mapped to all line items that do not have their own ReferenceInformation specified. For example, (1) a single AFE specified at the header will apply to the entire invoice, (2) each line item may have its own AFE specified, or (3) a header AFE applies to all line items without their own AFEs.-->
            <pidx:ReferenceInformation referenceInformationIndicator="AFENumber">
                <pidx:ReferenceNumber>${invoice.afe}</pidx:ReferenceNumber>
            </pidx:ReferenceInformation>
            <pidx:ReferenceInformation referenceInformationIndicator="CostCenter">
                <pidx:ReferenceNumber>${
  invoice.costCenter
}</pidx:ReferenceNumber>
            </pidx:ReferenceInformation>
            <pidx:Attachment>
              <pidx:AttachmentPurposeCode>Other</pidx:AttachmentPurposeCode>
              <pidx:AttachmentTitle>${
  invoice.invoiceId
}.pdf</pidx:AttachmentTitle>
              <pidx:AttachmentDescription>${
  invoice.invoiceId
}.pdf</pidx:AttachmentDescription>
              <pidx:AttachmentLocation>cid:Attachment1</pidx:AttachmentLocation>
          </pidx:Attachment>
        </pidx:InvoiceProperties>
        ${
  invoice.invoiceLinesRelation?.items !== undefined &&
          invoice.invoiceLinesRelation?.items.length > 0 &&
          `
          <pidx:InvoiceDetails>
          ${invoice.invoiceLinesRelation?.items
    .map(
      (lineItem, index) =>
        `
              <pidx:InvoiceLineItem>
                <pidx:LineItemNumber>${index + 1}</pidx:LineItemNumber>
                <pidx:InvoiceQuantity>
                    <pidx:Quantity>${lineItem.quantity}</pidx:Quantity>
                    <pidx:UnitOfMeasureCode>${
  lineItem.uom
}</pidx:UnitOfMeasureCode>
                </pidx:InvoiceQuantity>
                <pidx:LineItemInformation>
                    <pidx:LineItemIdentifier identifierIndicator="AssignedBySeller">test</pidx:LineItemIdentifier>
                    <pidx:LineItemDescription>${
  lineItem.description
}</pidx:LineItemDescription>
                </pidx:LineItemInformation>
                <pidx:Pricing>
                    <pidx:UnitPrice>
                        <pidx:MonetaryAmount>${
  lineItem.unitPrice
}</pidx:MonetaryAmount>
                        <pidx:UnitOfMeasureCode>${
  lineItem.uom
}</pidx:UnitOfMeasureCode>
                    </pidx:UnitPrice>
                </pidx:Pricing>
                ${
  lineItem.taxLinesRelation?.items !== undefined &&
                  lineItem.taxLinesRelation?.items.length > 0 &&
                  lineItem.taxLinesRelation?.items
                    .map(
                      (taxLine) =>
                        `
                    <!--All PIDX TaxTypeCodes EXCEPT 'Other' are supported.-->
                    <pidx:Tax>
                      <pidx:TaxTypeCode>${getTaxTypeCode(
    taxLine.taxCode,
  )}</pidx:TaxTypeCode>
                      <pidx:TaxRate>${taxLine.taxPercentage}</pidx:TaxRate>
                      <pidx:TaxAmount>
                          <pidx:MonetaryAmount>${
  taxLine.taxAmount
}</pidx:MonetaryAmount>
                      </pidx:TaxAmount>
                    </pidx:Tax>
                    `,
                    )
                    .join('')
}
              </pidx:InvoiceLineItem>
              `,
    )
    .join('')}
          </pidx:InvoiceDetails>
          `
}
        <pidx:InvoiceSummary>
            <pidx:TotalLineItems>${
  invoice.invoiceLinesRelation?.count
}</pidx:TotalLineItems>
            <pidx:InvoiceTotal>
                <pidx:MonetaryAmount>${invoice.total}</pidx:MonetaryAmount>
            </pidx:InvoiceTotal>
        </pidx:InvoiceSummary>
    </pidx:Invoice>
  `;
  return invoiceBody;
};
