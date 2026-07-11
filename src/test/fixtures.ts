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
import type { RequestLine } from '@/api/generated/models/requestLine';
import type { TradingPartner } from '@/api/generated/models/tradingPartner';

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
const BUYER_COMPANY_ID = '00000000-0000-0000-0000-000000000080';
const SUPPLIER_COMPANY_ID = COMPANY_ID;
const IMPORT_JOB_ID = '00000000-0000-0000-0000-000000000060';

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
      country: null,
      taxId: null,
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
            supplierCompany: { id: supplierAId, name: 'Supplier A', country: null, taxId: null },
            quoteLineId: QUOTE_LINE_ID,
            quantity: '100',
            unitPrice: '1.00',
            lineTotal: '100.00',
            currency: 'USD',
            status: 'SUBMITTED',
          },
          {
            quoteId: '00000000-0000-0000-0000-000000000093',
            supplierCompany: { id: supplierBId, name: 'Supplier B', country: null, taxId: null },
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
            supplierCompany: { id: supplierAId, name: 'Supplier A', country: null, taxId: null },
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
  QUOTE_ID,
  QUOTE_LINE_ID,
  BUYER_COMPANY_ID,
};
