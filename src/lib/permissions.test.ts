import { describe, expect, it } from 'vitest';

import {
  getActiveMembership,
  getActiveMemberships,
  getPendingInvitations,
  getSwitcherMemberships,
  hasAnyPermission,
  hasPermission,
  hasSuspendedMemberships,
  isEmailVerified,
  resolveActiveCompanyId,
  resolveAuthenticatedRedirect,
} from '@/lib/permissions';
import { navConfig } from '@/lib/navConfig';
import { createMembership, createTestUser, COMPANY_ID } from '@/test/fixtures';
import { PermissionValues } from '@/types/api';

const ALL_PERMISSIONS = Object.values(PermissionValues);

describe('permissions', () => {
  describe('generated Permission contract', () => {
    it('navConfig permissions are all backend-generated values', () => {
      for (const item of navConfig) {
        expect(ALL_PERMISSIONS).toContain(item.permission);
      }
    });

    it('exposes the full generated permission set', () => {
      expect(ALL_PERMISSIONS).toContain('manageIntegrations');
      expect(ALL_PERMISSIONS).toContain('viewRequests');
      expect(ALL_PERMISSIONS.length).toBeGreaterThanOrEqual(20);
    });
  });
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
            company: {
              id: 'other',
              name: 'Other',
              country: null,
              taxId: null,
              isActive: true,
            },
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

  describe('getSwitcherMemberships', () => {
    it('hides inactive companies for non-owners', () => {
      const user = createTestUser({
        memberships: [
          createMembership({
            role: 'VIEWER',
            company: {
              id: COMPANY_ID,
              name: 'Acme Corp',
              country: null,
              taxId: null,
              isActive: false,
            },
          }),
        ],
      });

      expect(getSwitcherMemberships(user)).toHaveLength(0);
    });

    it('keeps inactive companies for owners', () => {
      const user = createTestUser({
        memberships: [
          createMembership({
            role: 'OWNER',
            company: {
              id: COMPANY_ID,
              name: 'Acme Corp',
              country: null,
              taxId: null,
              isActive: false,
            },
          }),
        ],
      });

      expect(getSwitcherMemberships(user)).toHaveLength(1);
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
            invitedAt: '2026-01-01T00:00:00.000Z',
            expiresAt: '2026-12-31T00:00:00.000Z',
            company: {
              id: COMPANY_ID,
              name: 'Acme Corp',
              country: null,
              taxId: null,
              isActive: true,
            },
          },
          {
            id: '00000000-0000-0000-0000-000000000031',
            email: 'old@example.com',
            role: 'VIEWER',
            expired: true,
            invitedAt: '2025-01-01T00:00:00.000Z',
            expiresAt: '2025-01-01T00:00:00.000Z',
            company: {
              id: COMPANY_ID,
              name: 'Acme Corp',
              country: null,
              taxId: null,
              isActive: true,
            },
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
          isActive: true,
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
