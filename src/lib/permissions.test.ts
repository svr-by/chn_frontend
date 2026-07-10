import { describe, expect, it } from 'vitest';

import {
  getActiveMembership,
  getActiveMemberships,
  getPendingInvitations,
  hasAnyPermission,
  hasPermission,
  hasSuspendedMemberships,
  isEmailVerified,
  resolveActiveCompanyId,
  resolveAuthenticatedRedirect,
} from '@/lib/permissions';
import { createMembership, createTestUser, COMPANY_ID } from '@/test/fixtures';

describe('permissions', () => {
  describe('hasPermission', () => {
    it('returns true when permission is present', () => {
      expect(hasPermission(['viewMembers', 'manageMembers'], 'viewMembers')).toBe(
        true,
      );
    });

    it('returns false when permission is missing', () => {
      expect(hasPermission(['viewMembers'], 'manageMembers')).toBe(false);
    });
  });

  describe('hasAnyPermission', () => {
    it('returns true when any required permission matches', () => {
      expect(
        hasAnyPermission(['viewMembers'], ['manageMembers', 'viewMembers']),
      ).toBe(true);
    });

    it('returns false when none match', () => {
      expect(hasAnyPermission(['viewMembers'], ['manageMembers'])).toBe(false);
    });
  });

  describe('isEmailVerified', () => {
    it('returns true for verified users', () => {
      expect(isEmailVerified(createTestUser({ emailVerified: true }))).toBe(
        true,
      );
    });

    it('returns false for unverified users', () => {
      expect(isEmailVerified(createTestUser({ emailVerified: false }))).toBe(
        false,
      );
    });

    it('returns false when user is undefined', () => {
      expect(isEmailVerified(undefined)).toBe(false);
    });
  });

  describe('getActiveMembership', () => {
    it('returns membership for active company', () => {
      const user = createTestUser();
      const membership = getActiveMembership(user, COMPANY_ID);
      expect(membership?.company?.id).toBe(COMPANY_ID);
      expect(membership?.status).toBe('ACTIVE');
    });

    it('returns undefined for suspended membership', () => {
      const user = createTestUser({
        memberships: [createMembership({ status: 'SUSPENDED' })],
      });
      expect(getActiveMembership(user, COMPANY_ID)).toBeUndefined();
    });

    it('returns undefined when company id is null', () => {
      expect(getActiveMembership(createTestUser(), null)).toBeUndefined();
    });
  });

  describe('getActiveMemberships', () => {
    it('filters active memberships with a company', () => {
      const user = createTestUser({
        memberships: [
          createMembership(),
          createMembership({
            id: '00000000-0000-0000-0000-000000000021',
            status: 'SUSPENDED',
            company: { id: 'other', name: 'Other', country: null, taxId: null },
          }),
          createMembership({
            id: '00000000-0000-0000-0000-000000000022',
            company: undefined,
          }),
        ],
      });

      expect(getActiveMemberships(user)).toHaveLength(1);
    });

    it('returns empty array when user is undefined', () => {
      expect(getActiveMemberships(undefined)).toEqual([]);
    });
  });

  describe('getPendingInvitations', () => {
    it('excludes expired invitations', () => {
      const user = createTestUser({
        pendingInvitations: [
          {
            id: '00000000-0000-0000-0000-000000000030',
            email: 'invite@example.com',
            role: 'VIEWER',
            expired: false,
            expiresAt: '2026-12-31T00:00:00.000Z',
            company: { id: COMPANY_ID, name: 'Acme Corp', country: null, taxId: null },
          },
          {
            id: '00000000-0000-0000-0000-000000000031',
            email: 'old@example.com',
            role: 'VIEWER',
            expired: true,
            expiresAt: '2025-01-01T00:00:00.000Z',
            company: { id: COMPANY_ID, name: 'Acme Corp', country: null, taxId: null },
          },
        ],
      });

      expect(getPendingInvitations(user)).toHaveLength(1);
      expect(getPendingInvitations(user)[0]?.email).toBe('invite@example.com');
    });
  });

  describe('hasSuspendedMemberships', () => {
    it('returns true when user has a suspended company membership', () => {
      const user = createTestUser({
        memberships: [createMembership({ status: 'SUSPENDED' })],
      });

      expect(hasSuspendedMemberships(user)).toBe(true);
    });

    it('returns false when user has only active memberships', () => {
      expect(hasSuspendedMemberships(createTestUser())).toBe(false);
    });
  });

  describe('resolveAuthenticatedRedirect', () => {
    it('redirects to app when user has active membership', () => {
      expect(resolveAuthenticatedRedirect(createTestUser())).toBe('/app');
    });

    it('redirects suspended-only users to access-suspended', () => {
      const user = createTestUser({
        memberships: [createMembership({ status: 'SUSPENDED' })],
      });

      expect(resolveAuthenticatedRedirect(user)).toBe('/access-suspended');
    });

    it('redirects users without memberships to onboarding', () => {
      expect(
        resolveAuthenticatedRedirect(createTestUser({ memberships: [] })),
      ).toBe('/onboarding');
    });
  });

  describe('resolveActiveCompanyId', () => {
    const memberships = [
      createMembership(),
      createMembership({
        id: '00000000-0000-0000-0000-000000000021',
        company: {
          id: '00000000-0000-0000-0000-000000000011',
          name: 'Beta',
          country: null,
          taxId: null,
        },
      }),
    ];

    it('keeps current id when still valid', () => {
      expect(resolveActiveCompanyId(COMPANY_ID, memberships)).toBe(COMPANY_ID);
    });

    it('falls back to first membership when current is invalid', () => {
      expect(
        resolveActiveCompanyId('invalid-company', memberships),
      ).toBe(COMPANY_ID);
    });

    it('returns null when there are no active memberships', () => {
      expect(resolveActiveCompanyId(COMPANY_ID, [])).toBeNull();
    });
  });
});
