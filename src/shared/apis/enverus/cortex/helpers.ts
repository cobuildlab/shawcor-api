const xmlescape = require('escape-xml');

import { InvoiceType } from '../../../../modules/invoices/invoices-types';
import {
  PATH_MASTER_POST_INVOICE_CORTEX,
  PATH_POST_INVOICE_CORTEX,
} from '../../../constants';
import { EnvironmentEnum } from '../../../types';
import { getInvoiceTypeCode, getTaxTypeCode } from '../../helpers';

export const getApiUrl = (environment: string) => {
  if (environment === EnvironmentEnum.Main) {
    return PATH_POST_INVOICE_CORTEX;
  } else if (environment === EnvironmentEnum.Master) {
    return PATH_MASTER_POST_INVOICE_CORTEX;
  }
  return '';
};

// export const getSite = (customerName: string): string => {
//   if (customerName.toLowerCase().includes('baytex energy'))
//     return 'Accounts Payable - Canada G to N';
//   else if (customerName.toLowerCase().includes('crescent point resources'))
//     return 'DRILLING & COMPLETION';
//   else if (customerName.toLowerCase().includes('obsidian energy'))
//     return 'Capital';
//   else if (customerName.toLowerCase().includes('tundra oil and gas'))
//     return 'Tundra - Virden';
//   return '';
// };

/**
 * To generate request body to synchronize invoice.
 *
 * @param invoice - Invoice data from 8base DB.
 * @returns - Request body content, in XML format.
 */
export const getInvoiceBodyXML = (invoice: InvoiceType): string => {
  const invoiceTypeCode = getInvoiceTypeCode(invoice.invoiceId);

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
                    <pidx:ContactName>${xmlescape(
                      invoice.customer.name,
                    )}</pidx:ContactName>
                </pidx:ContactInformation>
            </pidx:PartnerInformation>
            <!-- SUPPLIER information -->
            <pidx:PartnerInformation partnerRoleIndicator="RemitTo">
                <pidx:PartnerIdentifier partnerIdentifierIndicator="DUNSNumber">249054263</pidx:PartnerIdentifier>
            </pidx:PartnerInformation>
            ${
              invoiceTypeCode
                ? `<pidx:InvoiceTypeCode>${invoiceTypeCode}</pidx:InvoiceTypeCode>`
                : ''
            }
            ${
              invoice.purchaseOrder
                ? `
              <!--Optional for OpenInvoice, may be required by the buyer-->
              <pidx:PurchaseOrderInformation>
                <pidx:PurchaseOrderNumber>${invoice.purchaseOrder}</pidx:PurchaseOrderNumber>
              </pidx:PurchaseOrderInformation>
            `
                : ''
            }
            <!--Required for OpenInvoice-->
            <pidx:PrimaryCurrency>
                <pidx:CurrencyCode>${invoice.currency}</pidx:CurrencyCode>
            </pidx:PrimaryCurrency>
            ${
              invoice.wellLocation
                ? `
              <!--Optional for OpenInvoice, may be required by the buyer-->
              <pidx:JobLocationInformation>
                <pidx:WellInformation>
                  <pidx:WellIdentifier>${xmlescape(
                    invoice.wellLocation,
                  )}</pidx:WellIdentifier>
                </pidx:WellInformation>
              </pidx:JobLocationInformation>
            `
                : ''
            }
            <!--Optional for OpenInvoice, may be required by the buyer-->
            <!--ReferenceInformation at the header (as well as PO, Field Ticket, Location and Service Datetime) will be mapped to all line items that do not have their own ReferenceInformation specified. For example, (1) a single AFE specified at the header will apply to the entire invoice, (2) each line item may have its own AFE specified, or (3) a header AFE applies to all line items without their own AFEs.-->
            ${
              invoice.afe
                ? `
              <pidx:ReferenceInformation referenceInformationIndicator="AFENumber">
                <pidx:ReferenceNumber>${xmlescape(
                  invoice.afe,
                )}</pidx:ReferenceNumber>
              </pidx:ReferenceInformation>
            `
                : ''
            }
            ${
              invoice.costCenter
                ? `
              <pidx:ReferenceInformation referenceInformationIndicator="CostCenter">
                <pidx:ReferenceNumber>${xmlescape(
                  invoice.costCenter,
                )}</pidx:ReferenceNumber>
              </pidx:ReferenceInformation>
            `
                : ''
            }
            ${
              invoice.priceBook
                ? `
              <pidx:ReferenceInformation referenceInformationIndicator="ContractNumber">
                <pidx:ReferenceNumber>${xmlescape(
                  invoice.priceBook,
                )}</pidx:ReferenceNumber>
              </pidx:ReferenceInformation>
            `
                : ''
            }

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

            ${
              invoice.approver || invoice.workLocation
                ? `
              <pidx:Comment>${
                invoice.approver ? `Approver: ${invoice.approver}` : ''
              }${invoice.approver ? ' - ' : ''}${
                    invoice.workLocation
                      ? `Work location: ${xmlescape(invoice.workLocation)}`
                      : ''
                  }</pidx:Comment>
                 `
                : ''
            }
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
                    <pidx:LineItemIdentifier identifierIndicator="AssignedBySeller">${
                      invoice.priceBook ? xmlescape(lineItem.itemNo) : 'MC-MSC'
                    }</pidx:LineItemIdentifier>
                    <pidx:LineItemDescription>${
                      invoice.priceBook
                        ? xmlescape(lineItem.description)
                        : 'Miscellaneous Charge-Miscellaneous Charges'
                    }</pidx:LineItemDescription>
                </pidx:LineItemInformation>
                ${
                  invoice.purchaseOrder
                    ? `
                  <pidx:PurchaseOrderLineItemNumber>${invoice.purchaseOrder}</pidx:PurchaseOrderLineItemNumber>
                `
                    : ''
                }
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
                      ${
                        lineItem.pst === 'NO'
                          ? `<pidx:TaxExemptCode>Exempt</pidx:TaxExemptCode>`
                          : ''
                      }
                      ${
                        lineItem.pst === 'YES'
                          ? `<pidx:TaxExemptCode>NonExempt</pidx:TaxExemptCode>`
                          : ''
                      }
                      <pidx:TaxRate>${
                        lineItem.pst === 'NO' ? '0.0' : taxLine.taxPercentage
                      }</pidx:TaxRate>
                      <pidx:TaxAmount>
                        <pidx:MonetaryAmount>${
                          lineItem.pst === 'NO' ? '0.0' : taxLine.taxAmount
                        }</pidx:MonetaryAmount>
                      </pidx:TaxAmount>
                    </pidx:Tax>
                    `,
                    )
                    .join('')
                }
                <pidx:ServiceDateTime dateTypeIndicator="ServicePeriodStart">${
                  invoice.invoiceDate
                }T00:00:00Z</pidx:ServiceDateTime>
                <pidx:ServiceDateTime dateTypeIndicator="ServicePeriodEnd">${
                  invoice.invoiceDate
                }T00:00:00Z</pidx:ServiceDateTime>
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
