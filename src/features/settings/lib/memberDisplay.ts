import type { TFunction } from 'i18next';

import type { MemberRole } from '@/types/api';

export function formatMemberRole(
  t: TFunction,
  role: MemberRole,
): string {
  return t(`enums:memberRole.${role.toLowerCase()}`);
}

export function formatUserName(
  firstName: string | null | undefined,
  lastName: string | null | undefined,
  email: string,
): string {
  const name = [firstName, lastName].filter(Boolean).join(' ').trim();
  return name || email;
}
