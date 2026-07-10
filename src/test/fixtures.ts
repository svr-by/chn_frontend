import type { GetAuthMe200User } from '@/api/generated/models/getAuthMe200User';
import type { GetAuthMe200UserMembershipsItem } from '@/api/generated/models/getAuthMe200UserMembershipsItem';

const COMPANY_ID = '00000000-0000-0000-0000-000000000010';
const USER_ID = '00000000-0000-0000-0000-000000000001';
const MEMBERSHIP_ID = '00000000-0000-0000-0000-000000000020';

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

export { COMPANY_ID, USER_ID, MEMBERSHIP_ID };
