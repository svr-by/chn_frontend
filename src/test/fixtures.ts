import type { GetAuthMe200User } from '@/api/generated/models/getAuthMe200User';
import type { GetAuthMe200UserMembershipsItem } from '@/api/generated/models/getAuthMe200UserMembershipsItem';
import type { PartnerCompany } from '@/api/generated/models/partnerCompany';
import type { TradingPartner } from '@/api/generated/models/tradingPartner';

const COMPANY_ID = '00000000-0000-0000-0000-000000000010';
const USER_ID = '00000000-0000-0000-0000-000000000001';
const MEMBERSHIP_ID = '00000000-0000-0000-0000-000000000020';
const PARTNER_COMPANY_ID = '00000000-0000-0000-0000-000000000030';
const PARTNER_LINK_ID = '00000000-0000-0000-0000-000000000031';

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

export { COMPANY_ID, USER_ID, MEMBERSHIP_ID, PARTNER_COMPANY_ID, PARTNER_LINK_ID };
