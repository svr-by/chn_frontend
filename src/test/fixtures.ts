import type { GetAuthMe200User } from '@/api/generated/models/getAuthMe200User';
import type { GetAuthMe200UserMembershipsItem } from '@/api/generated/models/getAuthMe200UserMembershipsItem';
import type { ImportJob } from '@/api/generated/models/importJob';
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
};
