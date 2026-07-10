import type { GetAuthMe200User } from '@/api/generated/models/getAuthMe200User';
import type { MembershipSummary, Permission, PendingInvitation } from '@/types/api';

export function hasPermission(
  permissions: Permission[],
  required: Permission,
): boolean {
  return permissions.includes(required);
}

export function hasAnyPermission(
  permissions: Permission[],
  required: Permission[],
): boolean {
  return required.some((permission) => permissions.includes(permission));
}

export function isEmailVerified(user: GetAuthMe200User | undefined): boolean {
  return user?.emailVerified === true;
}

export function hasSuspendedMemberships(
  user: GetAuthMe200User | undefined,
): boolean {
  if (!user) {
    return false;
  }

  return user.memberships.some(
    (membership) =>
      membership.status === 'SUSPENDED' && membership.company?.id != null,
  );
}

export type AuthenticatedRedirect = '/app' | '/onboarding' | '/access-suspended';

export function resolveAuthenticatedRedirect(
  user: GetAuthMe200User | undefined,
): AuthenticatedRedirect {
  if (getActiveMemberships(user).length > 0) {
    return '/app';
  }

  if (hasSuspendedMemberships(user)) {
    return '/access-suspended';
  }

  return '/onboarding';
}

export function getActiveMembership(
  user: GetAuthMe200User | undefined,
  companyId: string | null,
): MembershipSummary | undefined {
  if (!user || !companyId) {
    return undefined;
  }

  return user.memberships.find(
    (membership) =>
      membership.company?.id === companyId && membership.status === 'ACTIVE',
  );
}

export function getActiveMemberships(
  user: GetAuthMe200User | undefined,
): MembershipSummary[] {
  if (!user) {
    return [];
  }

  return user.memberships.filter(
    (membership) =>
      membership.status === 'ACTIVE' && membership.company?.id != null,
  );
}

export function getPendingInvitations(
  user: GetAuthMe200User | undefined,
): PendingInvitation[] {
  if (!user) {
    return [];
  }

  return user.pendingInvitations.filter((invitation) => !invitation.expired);
}

export function resolveActiveCompanyId(
  currentId: string | null,
  activeMemberships: MembershipSummary[],
): string | null {
  if (activeMemberships.length === 0) {
    return null;
  }

  const isCurrentValid = activeMemberships.some(
    (membership) => membership.company?.id === currentId,
  );

  if (isCurrentValid && currentId) {
    return currentId;
  }

  return activeMemberships[0]?.company?.id ?? null;
}
