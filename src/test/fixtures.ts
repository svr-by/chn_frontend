import type { ImportJob } from '@/api/generated/models/importJob';
import type { GetAuthMe200User } from '@/api/generated/models/getAuthMe200User';
import type { GetAuthMe200UserMembershipsItem } from '@/api/generated/models/getAuthMe200UserMembershipsItem';
import type { GetCompaniesCompanyIdRequestsRequestIdQuotesComparison200 } from '@/api/generated/models/getCompaniesCompanyIdRequestsRequestIdQuotesComparison200';
import type { InboundMaterialRequest } from '@/api/generated/models/inboundMaterialRequest';
import type { QuoteLine } from '@/api/generated/models/quoteLine';
import type { SupplierQuote } from '@/api/generated/models/supplierQuote';
import type { SupplierQuoteSummary } from '@/api/generated/models/supplierQuoteSummary';
import type { MaterialRequest } from '@/api/generated/models/materialRequest';
import type { MaterialRequestSummary } from '@/api/generated/models/materialRequestSummary';
import type { PartnerCompany } from '@/api/generated/models/partnerCompany';
import type { Product } from '@/api/generated/models/product';
import type { PurchaseSelection } from '@/api/generated/models/purchaseSelection';
import type { PurchaseSelectionSummary } from '@/api/generated/models/purchaseSelectionSummary';
import type { SelectionLine } from '@/api/generated/models/selectionLine';
import type { SupplierInvoice } from '@/api/generated/models/supplierInvoice';
import type { SupplierInvoiceSummary } from '@/api/generated/models/supplierInvoiceSummary';
import type { InvoiceLine } from '@/api/generated/models/invoiceLine';
import type { Payment } from '@/api/generated/models/payment';
import type { PaymentSummary } from '@/api/generated/models/paymentSummary';
import type { BillableLine } from '@/api/generated/models/billableLine';
import type { ShippableLine } from '@/api/generated/models/shippableLine';
import type { ShippingInvoice } from '@/api/generated/models/shippingInvoice';
import type { ShippingInvoiceSummary } from '@/api/generated/models/shippingInvoiceSummary';
import type { Consolidation } from '@/api/generated/models/consolidation';
import type { ConsolidationShippingInvoiceEntry } from '@/api/generated/models/consolidationShippingInvoiceEntry';
import type { ConsolidationSummary } from '@/api/generated/models/consolidationSummary';
import type { ShippingLine } from '@/api/generated/models/shippingLine';
import type { RequestLine } from '@/api/generated/models/requestLine';
import type { TradingPartner } from '@/api/generated/models/tradingPartner';
import type { Comment } from '@/api/generated/models/comment';
import type { ActivityItem } from '@/api/generated/models/activityItem';
import type { Notification } from '@/api/generated/models/notification';
import type { LineageTrace } from '@/api/generated/models/lineageTrace';
import type { LineageEvent } from '@/api/generated/models/lineageEvent';
import type { TraceSearchItem } from '@/api/generated/models/traceSearchItem';
import type { RequestLineListItem } from '@/api/generated/models/requestLineListItem';
import type { DocumentRelationships } from '@/api/generated/models/documentRelationships';
import type { CompanyApiKey } from '@/api/generated/models/companyApiKey';
import type { PartnerExternalMapping } from '@/api/generated/models/partnerExternalMapping';
import type { IntegrationWebhook } from '@/api/generated/models/integrationWebhook';
import type { ExportJob } from '@/api/generated/models/exportJob';

const COMPANY_ID = '00000000-0000-0000-0000-000000000010';
const USER_ID = '00000000-0000-0000-0000-000000000001';
const MEMBERSHIP_ID = '00000000-0000-0000-0000-000000000020';
const PARTNER_COMPANY_ID = '00000000-0000-0000-0000-000000000030';
const PARTNER_LINK_ID = '00000000-0000-0000-0000-000000000031';
const PRODUCT_ID = '00000000-0000-0000-0000-000000000040';
const REQUEST_ID = '00000000-0000-0000-0000-000000000050';
const REQUEST_LINE_ID = '00000000-0000-0000-0000-000000000051';
const QUOTE_ID = '00000000-0000-0000-0000-000000000070';
const QUOTE_LINE_ID = '00000000-0000-0000-0000-000000000071';
const SELECTION_ID = '00000000-0000-0000-0000-000000000100';
const SELECTION_LINE_ID = '00000000-0000-0000-0000-000000000101';
const INVOICE_ID = '00000000-0000-0000-0000-000000000110';
const INVOICE_LINE_ID = '00000000-0000-0000-0000-000000000111';
const PAYMENT_ID = '00000000-0000-0000-0000-000000000120';
const SHIPPING_INVOICE_ID = '00000000-0000-0000-0000-000000000130';
const SHIPPING_LINE_ID = '00000000-0000-0000-0000-000000000131';
const CONSOLIDATION_ID = '00000000-0000-0000-0000-000000000140';
const CONSOLIDATION_ENTRY_ID = '00000000-0000-0000-0000-000000000141';
const COMMENT_ID = '00000000-0000-0000-0000-000000000150';
const NOTIFICATION_ID = '00000000-0000-0000-0000-000000000160';
const ACTIVITY_ID = '00000000-0000-0000-0000-000000000170';
const LINEAGE_ID = '00000000-0000-0000-0000-000000000052';
const LINEAGE_EVENT_ID = '00000000-0000-0000-0000-000000000180';
const BUYER_COMPANY_ID = '00000000-0000-0000-0000-000000000080';
const SUPPLIER_COMPANY_ID = COMPANY_ID;
const IMPORT_JOB_ID = '00000000-0000-0000-0000-000000000060';
const API_KEY_ID = '00000000-0000-0000-0000-000000000190';
const MAPPING_ID = '00000000-0000-0000-0000-000000000191';
const WEBHOOK_ID = '00000000-0000-0000-0000-000000000192';
const EXPORT_JOB_ID = '00000000-0000-0000-0000-000000000193';

export function createImportPreview(
  overrides: Partial<{
    validRowCount: number;
    invalidRowCount: number;
  }> = {},
) {
  const validRowCount = overrides.validRowCount ?? 1;
  const invalidRowCount = overrides.invalidRowCount ?? 1;

  return {
    preview: {
      validRowCount,
      invalidRowCount,
      rows: [
        {
          rowNumber: 1,
          data: { description: 'Office paper', quantity: '10.5' },
          errors: [],
          parsed: {
            description: 'Office paper',
            quantity: '10.5',
            unit: 'pack',
            sku: 'PAPER-A4',
            productId: PRODUCT_ID,
            notes: null,
          },
        },
        {
          rowNumber: 2,
          data: { description: 'Pens', quantity: '' },
          errors: ['Quantity is required'],
          parsed: undefined,
        },
      ],
    },
    columnMapping: {
      description: 'description',
      quantity: 'quantity',
      unit: 'unit',
      sku: 'sku',
    },
  };
}

export function createImportJob(overrides: Partial<ImportJob> = {}): ImportJob {
  return {
    id: IMPORT_JOB_ID,
    companyId: COMPANY_ID,
    createdByUserId: USER_ID,
    type: 'REQUEST_LINES',
    status: 'PREVIEW_READY',
    fileName: 'lines.csv',
    fieldDelimiter: ',',
    decimalSeparator: '.',
    requestTitle: 'Imported request',
    preview: createImportPreview().preview,
    materialRequestId: null,
    errorMessage: null,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

export function createProduct(overrides: Partial<Product> = {}): Product {
  return {
    id: PRODUCT_ID,
    companyId: COMPANY_ID,
    sku: 'SKU-001',
    name: 'Test Product',
    description: 'Sample product',
    unit: 'pcs',
    attributes: null,
    isActive: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

export function createRequestLine(
  overrides: Partial<RequestLine> = {},
): RequestLine {
  return {
    id: REQUEST_LINE_ID,
    lineNumber: 1,
    lineageId: '00000000-0000-0000-0000-000000000052',
    description: 'Test line',
    quantity: '10',
    unit: 'pcs',
    attributes: null,
    notes: null,
    product: {
      id: PRODUCT_ID,
      name: 'Test Product',
      sku: 'SKU-001',
      unit: 'pcs',
    },
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

export function createMaterialRequest(
  overrides: Partial<MaterialRequest> = {},
): MaterialRequest {
  return {
    id: REQUEST_ID,
    companyId: COMPANY_ID,
    createdByUserId: USER_ID,
    title: 'Office supplies',
    reference: 'REQ-001',
    status: 'DRAFT',
    notes: null,
    submittedAt: null,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    lines: [createRequestLine()],
    ...overrides,
  };
}

export function createMaterialRequestSummary(
  overrides: Partial<MaterialRequestSummary> = {},
): MaterialRequestSummary {
  return {
    id: REQUEST_ID,
    companyId: COMPANY_ID,
    title: 'Office supplies',
    reference: 'REQ-001',
    status: 'DRAFT',
    submittedAt: null,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

export function createRequestLineListItem(
  overrides: Partial<RequestLineListItem> = {},
): RequestLineListItem {
  return {
    id: REQUEST_LINE_ID,
    lineNumber: 1,
    lineageId: LINEAGE_ID,
    description: 'Office paper',
    quantity: '10.0000',
    unit: 'pack',
    attributes: { importSku: 'PAPER-A4' },
    notes: null,
    product: {
      id: PRODUCT_ID,
      name: 'A4 Paper',
      sku: 'PAPER-A4',
      unit: 'pack',
    },
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-02T00:00:00.000Z',
    request: {
      id: REQUEST_ID,
      title: 'Office supplies',
      reference: 'REQ-001',
      status: 'SUBMITTED',
      createdByUserId: USER_ID,
    },
    links: {
      distributed: true,
      hasQuote: true,
      hasSelection: false,
      hasInvoice: false,
      hasShipping: false,
      hasConsolidation: false,
      stage: 'quoted',
    },
    ...overrides,
  };
}

export function createPartnerCompany(
  overrides: Partial<PartnerCompany> = {},
): PartnerCompany {
  return {
    id: PARTNER_COMPANY_ID,
    name: 'Partner Corp',
    taxId: 'TAX-123',
    country: 'US',
    ...overrides,
  };
}

export function createTradingPartner(
  overrides: Partial<TradingPartner> = {},
): TradingPartner {
  return {
    id: PARTNER_LINK_ID,
    status: 'INVITED',
    direction: 'inbound',
    company: createPartnerCompany(),
    invitedAt: '2026-01-01T00:00:00.000Z',
    acceptedAt: null,
    rejectedAt: null,
    ...overrides,
  };
}

export function createMembership(
  overrides: Partial<GetAuthMe200UserMembershipsItem> = {},
): GetAuthMe200UserMembershipsItem {
  return {
    id: MEMBERSHIP_ID,
    role: 'OWNER',
    status: 'ACTIVE',
    permissions: null,
    effectivePermissions: ['manageMembers', 'viewMembers'],
    invitedAt: null,
    joinedAt: '2026-01-01T00:00:00.000Z',
    company: {
      id: COMPANY_ID,
      name: 'Acme Corp',
      country: null,
      taxId: null,
    },
    ...overrides,
  };
}

export function createTestUser(
  overrides: Partial<GetAuthMe200User> = {},
): GetAuthMe200User {
  return {
    id: USER_ID,
    email: 'user@example.com',
    firstName: 'Test',
    lastName: 'User',
    emailVerified: true,
    memberships: [createMembership()],
    pendingInvitations: [],
    ...overrides,
  };
}

export function createQuoteLine(
  overrides: Partial<QuoteLine> = {},
): QuoteLine {
  return {
    id: QUOTE_LINE_ID,
    lineNumber: 1,
    lineageId: '00000000-0000-0000-0000-000000000072',
    requestLineId: REQUEST_LINE_ID,
    quantity: '10',
    unitPrice: '5.50',
    lineTotal: '55.00',
    notes: null,
    requestLine: {
      id: REQUEST_LINE_ID,
      lineNumber: 1,
      description: 'Test line',
      quantity: '10',
      unit: 'pcs',
    },
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

export function createSupplierQuote(
  overrides: Partial<SupplierQuote> = {},
): SupplierQuote {
  return {
    id: QUOTE_ID,
    materialRequestId: REQUEST_ID,
    buyerCompanyId: BUYER_COMPANY_ID,
    supplierCompanyId: SUPPLIER_COMPANY_ID,
    createdByUserId: USER_ID,
    status: 'DRAFT',
    currency: 'USD',
    validUntil: null,
    notes: null,
    submittedAt: null,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    buyerCompany: {
      id: BUYER_COMPANY_ID,
      name: 'Buyer Corp',
    },
    supplierCompany: {
      id: SUPPLIER_COMPANY_ID,
      name: 'Acme Corp',
    },
    lines: [createQuoteLine()],
    ...overrides,
  };
}

export function createSupplierQuoteSummary(
  overrides: Partial<SupplierQuoteSummary> = {},
): SupplierQuoteSummary {
  return {
    id: QUOTE_ID,
    materialRequestId: REQUEST_ID,
    buyerCompanyId: BUYER_COMPANY_ID,
    supplierCompanyId: SUPPLIER_COMPANY_ID,
    status: 'DRAFT',
    currency: 'USD',
    validUntil: null,
    submittedAt: null,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    buyerCompany: {
      id: BUYER_COMPANY_ID,
      name: 'Buyer Corp',
    },
    supplierCompany: {
      id: SUPPLIER_COMPANY_ID,
      name: 'Acme Corp',
    },
    ...overrides,
  };
}

export function createInboundMaterialRequest(
  overrides: Partial<InboundMaterialRequest> = {},
): InboundMaterialRequest {
  return {
    ...createMaterialRequest({ status: 'QUOTING', submittedAt: '2026-01-01T00:00:00.000Z' }),
    buyerCompany: {
      id: BUYER_COMPANY_ID,
      name: 'Buyer Corp',
    },
    distributedAt: '2026-01-02T00:00:00.000Z',
    ...overrides,
  };
}

export function createQuoteComparison(
  overrides: Partial<GetCompaniesCompanyIdRequestsRequestIdQuotesComparison200> = {},
): GetCompaniesCompanyIdRequestsRequestIdQuotesComparison200 {
  const supplierAId = '00000000-0000-0000-0000-000000000090';
  const supplierBId = '00000000-0000-0000-0000-000000000091';
  const line2Id = '00000000-0000-0000-0000-000000000053';

  return {
    request: createMaterialRequest({ status: 'QUOTING' }),
    suppliers: [
      {
        companyId: supplierAId,
        name: 'Supplier A',
        quoteId: '00000000-0000-0000-0000-000000000092',
        status: 'SUBMITTED',
        submittedAt: '2026-01-03T00:00:00.000Z',
      },
      {
        companyId: supplierBId,
        name: 'Supplier B',
        quoteId: '00000000-0000-0000-0000-000000000093',
        status: 'SUBMITTED',
        submittedAt: '2026-01-03T01:00:00.000Z',
      },
    ],
    lines: [
      {
        requestLine: {
          id: REQUEST_LINE_ID,
          lineageId: '00000000-0000-0000-0000-000000000052',
          lineNumber: 1,
          description: 'Bolt M8',
          quantity: '100',
          unit: 'pcs',
        },
        offers: [
          {
            quoteId: '00000000-0000-0000-0000-000000000092',
            supplierCompany: { id: supplierAId, name: 'Supplier A' },
            quoteLineId: QUOTE_LINE_ID,
            quantity: '100',
            unitPrice: '1.00',
            lineTotal: '100.00',
            currency: 'USD',
            status: 'SUBMITTED',
          },
          {
            quoteId: '00000000-0000-0000-0000-000000000093',
            supplierCompany: { id: supplierBId, name: 'Supplier B' },
            quoteLineId: '00000000-0000-0000-0000-000000000094',
            quantity: '100',
            unitPrice: '0.90',
            lineTotal: '90.00',
            currency: 'USD',
            status: 'SUBMITTED',
          },
        ],
      },
      {
        requestLine: {
          id: line2Id,
          lineageId: '00000000-0000-0000-0000-000000000054',
          lineNumber: 2,
          description: 'Nut M8',
          quantity: '50',
          unit: 'pcs',
        },
        offers: [
          {
            quoteId: '00000000-0000-0000-0000-000000000092',
            supplierCompany: { id: supplierAId, name: 'Supplier A' },
            quoteLineId: '00000000-0000-0000-0000-000000000095',
            quantity: '50',
            unitPrice: '0.50',
            lineTotal: '25.00',
            currency: 'USD',
            status: 'SUBMITTED',
          },
        ],
      },
    ],
    ...overrides,
  };
}

export function createSelectionLine(
  overrides: Partial<SelectionLine> = {},
): SelectionLine {
  return {
    id: SELECTION_LINE_ID,
    lineNumber: 1,
    lineageId: '00000000-0000-0000-0000-000000000102',
    quantity: '10',
    notes: null,
    quoteLine: {
      id: QUOTE_LINE_ID,
      quantity: '100',
      unitPrice: '1.00',
    },
    quote: {
      id: QUOTE_ID,
      currency: 'USD',
      supplierCompany: {
        id: SUPPLIER_COMPANY_ID,
        name: 'Supplier A',
      },
    },
    requestLine: {
      id: REQUEST_LINE_ID,
      description: 'Bolt M8',
      quantity: '100',
      unit: 'pcs',
    },
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

export function createPurchaseSelection(
  overrides: Partial<PurchaseSelection> = {},
): PurchaseSelection {
  return {
    id: SELECTION_ID,
    materialRequestId: REQUEST_ID,
    buyerCompanyId: COMPANY_ID,
    createdByUserId: USER_ID,
    status: 'DRAFT',
    notes: null,
    confirmedAt: null,
    cancelledAt: null,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    materialRequest: {
      id: REQUEST_ID,
      title: 'Office supplies',
      status: 'QUOTING',
    },
    lines: [createSelectionLine()],
    ...overrides,
  };
}

export function createPurchaseSelectionSummary(
  overrides: Partial<PurchaseSelectionSummary> = {},
): PurchaseSelectionSummary {
  return {
    id: SELECTION_ID,
    materialRequestId: REQUEST_ID,
    buyerCompanyId: COMPANY_ID,
    status: 'DRAFT',
    notes: null,
    confirmedAt: null,
    cancelledAt: null,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

export function createInvoiceLine(
  overrides: Partial<InvoiceLine> = {},
): InvoiceLine {
  return {
    id: INVOICE_LINE_ID,
    lineNumber: 1,
    lineageId: '00000000-0000-0000-0000-000000000112',
    quantity: '10',
    unitPrice: '1.00',
    lineTotal: '10.00',
    notes: null,
    selectionLine: {
      id: SELECTION_LINE_ID,
      quantity: '10',
    },
    requestLine: {
      id: REQUEST_LINE_ID,
      description: 'Bolt M8',
      quantity: '100',
      unit: 'pcs',
    },
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

export function createSupplierInvoice(
  overrides: Partial<SupplierInvoice> = {},
): SupplierInvoice {
  return {
    id: INVOICE_ID,
    materialRequestId: REQUEST_ID,
    purchaseSelectionId: SELECTION_ID,
    buyerCompanyId: BUYER_COMPANY_ID,
    supplierCompanyId: SUPPLIER_COMPANY_ID,
    createdByUserId: USER_ID,
    status: 'DRAFT',
    currency: 'USD',
    invoiceNumber: null,
    notes: null,
    issuedAt: null,
    confirmedAt: null,
    totalAmount: '10.00',
    confirmedPaidAmount: '0.00',
    remainingAmount: '10.00',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    buyerCompany: {
      id: BUYER_COMPANY_ID,
      name: 'Buyer Co',
    },
    supplierCompany: {
      id: SUPPLIER_COMPANY_ID,
      name: 'Supplier A',
    },
    lines: [createInvoiceLine()],
    payments: [],
    ...overrides,
  };
}

export function createSupplierInvoiceSummary(
  overrides: Partial<SupplierInvoiceSummary> = {},
): SupplierInvoiceSummary {
  return {
    id: INVOICE_ID,
    materialRequestId: REQUEST_ID,
    buyerCompanyId: BUYER_COMPANY_ID,
    supplierCompanyId: SUPPLIER_COMPANY_ID,
    status: 'DRAFT',
    currency: 'USD',
    invoiceNumber: null,
    issuedAt: null,
    confirmedAt: null,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    buyerCompany: {
      id: BUYER_COMPANY_ID,
      name: 'Buyer Co',
    },
    supplierCompany: {
      id: SUPPLIER_COMPANY_ID,
      name: 'Supplier A',
    },
    ...overrides,
  };
}

export function createPayment(
  overrides: Partial<Payment> = {},
): Payment {
  return {
    id: PAYMENT_ID,
    invoiceId: INVOICE_ID,
    buyerCompanyId: BUYER_COMPANY_ID,
    registeredByUserId: USER_ID,
    confirmedByUserId: null,
    status: 'PENDING',
    amount: '10.00',
    currency: 'USD',
    fileName: null,
    rejectionReason: null,
    notes: null,
    uploadedAt: null,
    confirmedAt: null,
    rejectedAt: null,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    invoice: {
      id: INVOICE_ID,
      status: 'ISSUED',
      currency: 'USD',
      buyerCompanyId: BUYER_COMPANY_ID,
      supplierCompanyId: SUPPLIER_COMPANY_ID,
    },
    ...overrides,
  };
}

export function createPaymentSummary(
  overrides: Partial<PaymentSummary> = {},
): PaymentSummary {
  return {
    id: PAYMENT_ID,
    invoiceId: INVOICE_ID,
    status: 'PENDING',
    amount: '10.00',
    currency: 'USD',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

export function createBillableLine(
  overrides: Partial<BillableLine> = {},
): BillableLine {
  return {
    selectionLineId: SELECTION_LINE_ID,
    lineageId: '00000000-0000-0000-0000-000000000112',
    quantity: '10',
    unitPrice: '1.00',
    lineTotal: '10.00',
    quoteLine: {
      id: QUOTE_LINE_ID,
      quantity: '100',
      unitPrice: '1.00',
    },
    requestLine: {
      id: REQUEST_LINE_ID,
      description: 'Bolt M8',
      quantity: '100',
      unit: 'pcs',
    },
    ...overrides,
  };
}

export function createShippableLine(
  overrides: Partial<ShippableLine> = {},
): ShippableLine {
  return {
    invoiceLineId: INVOICE_LINE_ID,
    lineNumber: 1,
    lineageId: '00000000-0000-0000-0000-000000000112',
    invoiceQuantity: '10',
    shippedQuantity: '0',
    remainingQuantity: '10',
    requestLine: {
      id: REQUEST_LINE_ID,
      description: 'Bolt M8',
      quantity: '100',
      unit: 'pcs',
    },
    ...overrides,
  };
}

export function createShippingLine(
  overrides: Partial<ShippingLine> = {},
): ShippingLine {
  return {
    id: SHIPPING_LINE_ID,
    lineNumber: 1,
    lineageId: '00000000-0000-0000-0000-000000000112',
    quantity: '10',
    notes: null,
    invoiceLine: {
      id: INVOICE_LINE_ID,
      quantity: '10',
      unitPrice: '1.00',
      lineTotal: '10.00',
    },
    requestLine: {
      id: REQUEST_LINE_ID,
      description: 'Bolt M8',
      quantity: '100',
      unit: 'pcs',
    },
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

export function createShippingInvoice(
  overrides: Partial<ShippingInvoice> = {},
): ShippingInvoice {
  return {
    id: SHIPPING_INVOICE_ID,
    supplierInvoiceId: INVOICE_ID,
    materialRequestId: REQUEST_ID,
    buyerCompanyId: BUYER_COMPANY_ID,
    supplierCompanyId: SUPPLIER_COMPANY_ID,
    managedByCompanyId: SUPPLIER_COMPANY_ID,
    createdByUserId: USER_ID,
    status: 'DRAFT',
    trackingNumber: null,
    carrier: null,
    notes: null,
    issuedAt: null,
    inTransitAt: null,
    deliveredAt: null,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    buyerCompany: {
      id: BUYER_COMPANY_ID,
      name: 'Buyer Co',
    },
    supplierCompany: {
      id: SUPPLIER_COMPANY_ID,
      name: 'Supplier A',
    },
    managedByCompany: {
      id: SUPPLIER_COMPANY_ID,
      name: 'Supplier A',
    },
    supplierInvoice: {
      id: INVOICE_ID,
      status: 'ISSUED',
      invoiceNumber: 'INV-001',
    },
    lines: [createShippingLine()],
    ...overrides,
  };
}

export function createShippingInvoiceSummary(
  overrides: Partial<ShippingInvoiceSummary> = {},
): ShippingInvoiceSummary {
  return {
    id: SHIPPING_INVOICE_ID,
    status: 'DRAFT',
    supplierInvoiceId: INVOICE_ID,
    materialRequestId: REQUEST_ID,
    buyerCompany: {
      id: BUYER_COMPANY_ID,
      name: 'Buyer Co',
    },
    supplierCompany: {
      id: SUPPLIER_COMPANY_ID,
      name: 'Supplier A',
    },
    managedByCompany: {
      id: SUPPLIER_COMPANY_ID,
      name: 'Supplier A',
    },
    trackingNumber: null,
    carrier: null,
    lineCount: 1,
    issuedAt: null,
    inTransitAt: null,
    deliveredAt: null,
    createdAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

export function createConsolidationShippingInvoiceEntry(
  overrides: Partial<ConsolidationShippingInvoiceEntry> = {},
): ConsolidationShippingInvoiceEntry {
  const shippingInvoice = createShippingInvoice({
    status: 'DELIVERED',
    deliveredAt: '2026-01-05T00:00:00.000Z',
  });

  return {
    id: CONSOLIDATION_ENTRY_ID,
    lineNumber: 1,
    notes: null,
    shippingInvoice: {
      id: shippingInvoice.id,
      status: shippingInvoice.status,
      materialRequestId: shippingInvoice.materialRequestId,
      supplierCompanyId: shippingInvoice.supplierCompanyId,
      supplierCompany: shippingInvoice.supplierCompany,
      trackingNumber: shippingInvoice.trackingNumber,
      carrier: shippingInvoice.carrier,
      lines: shippingInvoice.lines,
    },
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

export function createConsolidation(
  overrides: Partial<Consolidation> = {},
): Consolidation {
  return {
    id: CONSOLIDATION_ID,
    buyerCompanyId: BUYER_COMPANY_ID,
    createdByUserId: USER_ID,
    status: 'DRAFT',
    transportMode: 'ROAD',
    carrier: 'Fast Freight',
    trackingNumber: 'TRK-001',
    origin: 'Shanghai',
    destination: 'Moscow',
    notes: null,
    plannedAt: null,
    inTransitAt: null,
    customsAt: null,
    deliveredAt: null,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    buyerCompany: {
      id: BUYER_COMPANY_ID,
      name: 'Buyer Co',
    },
    shippingInvoices: [createConsolidationShippingInvoiceEntry()],
    ...overrides,
  };
}

export function createConsolidationSummary(
  overrides: Partial<ConsolidationSummary> = {},
): ConsolidationSummary {
  return {
    id: CONSOLIDATION_ID,
    status: 'DRAFT',
    buyerCompanyId: BUYER_COMPANY_ID,
    buyerCompany: {
      id: BUYER_COMPANY_ID,
      name: 'Buyer Co',
    },
    transportMode: 'ROAD',
    carrier: 'Fast Freight',
    trackingNumber: 'TRK-001',
    origin: 'Shanghai',
    destination: 'Moscow',
    shippingInvoiceCount: 1,
    plannedAt: null,
    inTransitAt: null,
    customsAt: null,
    deliveredAt: null,
    createdAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

export function createComment(overrides: Partial<Comment> = {}): Comment {
  return {
    id: COMMENT_ID,
    documentType: 'INVOICE',
    documentId: INVOICE_ID,
    body: 'Please confirm delivery date.',
    createdAt: '2026-01-01T12:00:00.000Z',
    updatedAt: '2026-01-01T12:00:00.000Z',
    author: {
      userId: USER_ID,
      companyId: COMPANY_ID,
      companyName: 'Acme Corp',
      name: 'Jane Doe',
      email: 'jane@example.com',
    },
    ...overrides,
  };
}

export function createActivityItem(
  overrides: Partial<ActivityItem> = {},
): ActivityItem {
  return {
    id: ACTIVITY_ID,
    source: 'event',
    createdAt: '2026-01-01T12:00:00.000Z',
    actor: {
      userId: USER_ID,
      companyId: COMPANY_ID,
      name: 'Jane Doe',
    },
    eventType: 'INVOICE_ISSUED',
    ...overrides,
  };
}

export function createNotification(
  overrides: Partial<Notification> = {},
): Notification {
  return {
    id: NOTIFICATION_ID,
    type: 'COMMENT_ADDED',
    documentType: 'INVOICE',
    documentId: INVOICE_ID,
    commentId: COMMENT_ID,
    documentEventId: null,
    title: 'New comment on invoice',
    body: 'Please confirm delivery date.',
    readAt: null,
    createdAt: '2026-01-01T12:00:00.000Z',
    ...overrides,
  };
}

export function createTraceSearchItem(
  overrides: Partial<TraceSearchItem> = {},
): TraceSearchItem {
  return {
    lineageId: LINEAGE_ID,
    requestId: REQUEST_ID,
    requestTitle: 'Office supplies',
    description: 'Office paper',
    quantity: '10.0000',
    unit: 'pack',
    pipelineStatus: 'quoted',
    updatedAt: '2026-01-01T12:00:00.000Z',
    ...overrides,
  };
}

export function createLineageTrace(
  overrides: Partial<LineageTrace> = {},
): LineageTrace {
  return {
    lineageId: LINEAGE_ID,
    request: {
      id: REQUEST_ID,
      companyId: COMPANY_ID,
      title: 'Office supplies',
      reference: 'REQ-001',
      status: 'QUOTING',
      submittedAt: '2026-01-01T00:00:00.000Z',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    },
    requestLine: {
      id: REQUEST_LINE_ID,
      lineNumber: 1,
      lineageId: LINEAGE_ID,
      description: 'Office paper',
      quantity: '10.0000',
      unit: 'pack',
      attributes: null,
      notes: null,
      product: null,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    },
    quotes: [
      {
        quoteId: QUOTE_ID,
        supplierCompany: {
          id: SUPPLIER_COMPANY_ID,
          name: 'Supplier Ltd',
        },
        status: 'SUBMITTED',
        currency: 'USD',
        line: {
          id: QUOTE_LINE_ID,
          lineNumber: 1,
          lineageId: LINEAGE_ID,
          quantity: '10.0000',
          unitPrice: '5.0000',
          lineTotal: '50.0000',
          notes: null,
        },
      },
    ],
    selections: [],
    invoices: [],
    shipments: [],
    consolidations: [],
    ...overrides,
  };
}

export function createLineageEvent(
  overrides: Partial<LineageEvent> = {},
): LineageEvent {
  return {
    id: LINEAGE_EVENT_ID,
    documentType: 'INVOICE',
    documentId: INVOICE_ID,
    eventType: 'INVOICE_ISSUED',
    createdAt: '2026-01-01T12:00:00.000Z',
    actor: {
      userId: USER_ID,
      companyId: COMPANY_ID,
      name: 'Jane Doe',
    },
    ...overrides,
  };
}

export function createDocumentRelationships(
  overrides: Partial<DocumentRelationships> = {},
): DocumentRelationships {
  return {
    nodes: [
      {
        id: REQUEST_ID,
        documentType: 'MATERIAL_REQUEST',
        status: 'QUOTING',
        label: 'Office supplies',
      },
      {
        id: INVOICE_ID,
        documentType: 'INVOICE',
        status: 'ISSUED',
        label: 'INV-001',
      },
    ],
    edges: [
      {
        fromId: REQUEST_ID,
        toId: INVOICE_ID,
        relation: 'generates',
      },
    ],
    ...overrides,
  };
}

export function createApiKey(
  overrides: Partial<CompanyApiKey> = {},
): CompanyApiKey {
  return {
    id: API_KEY_ID,
    companyId: COMPANY_ID,
    name: 'ERP sync',
    keyPrefix: 'chn_live_abcd',
    scopes: ['viewRequests', 'viewInvoices'],
    lastUsedAt: null,
    expiresAt: null,
    revokedAt: null,
    createdAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

export function createPartnerMapping(
  overrides: Partial<PartnerExternalMapping> = {},
): PartnerExternalMapping {
  return {
    id: MAPPING_ID,
    companyId: COMPANY_ID,
    mappingType: 'COUNTERPARTY_CODE',
    internalKey: PARTNER_COMPANY_ID,
    externalCode: 'EXT-001',
    metadata: {},
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

export function createIntegrationWebhook(
  overrides: Partial<IntegrationWebhook> = {},
): IntegrationWebhook {
  return {
    id: WEBHOOK_ID,
    companyId: COMPANY_ID,
    url: 'https://example.com/webhooks/chn',
    eventTypes: ['INVOICE_ISSUED', 'PAYMENT_CONFIRMED'],
    isActive: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

export function createExportJob(
  overrides: Partial<ExportJob> = {},
): ExportJob {
  return {
    id: EXPORT_JOB_ID,
    companyId: COMPANY_ID,
    type: 'REQUESTS',
    status: 'PENDING',
    filters: {},
    errorMessage: null,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

export {
  COMPANY_ID,
  USER_ID,
  MEMBERSHIP_ID,
  PARTNER_COMPANY_ID,
  PARTNER_LINK_ID,
  PRODUCT_ID,
  REQUEST_ID,
  REQUEST_LINE_ID,
  IMPORT_JOB_ID,
  API_KEY_ID,
  MAPPING_ID,
  WEBHOOK_ID,
  EXPORT_JOB_ID,
  QUOTE_ID,
  QUOTE_LINE_ID,
  SELECTION_ID,
  SELECTION_LINE_ID,
  INVOICE_ID,
  INVOICE_LINE_ID,
  PAYMENT_ID,
  SHIPPING_INVOICE_ID,
  SHIPPING_LINE_ID,
  CONSOLIDATION_ID,
  CONSOLIDATION_ENTRY_ID,
  COMMENT_ID,
  NOTIFICATION_ID,
  LINEAGE_ID,
  LINEAGE_EVENT_ID,
  ACTIVITY_ID,
  BUYER_COMPANY_ID,
  SUPPLIER_COMPANY_ID,
};
