import { useGetMeQuery } from '@/api/endpoints/authApi';
import { useAppSelector } from '@/hooks/useAppSelector';
import { authStorage } from '@/lib/authStorage';
import {
  getActiveMembership,
  hasPermission,
  hasAnyPermission,
} from '@/lib/permissions';
import type { Permission } from '@/types/api';

export function usePermissions() {
  const activeCompanyId = useAppSelector((state) => state.auth.activeCompanyId);
  const hasRefreshToken = Boolean(authStorage.getRefreshToken());
  const { data, isLoading, isFetching } = useGetMeQuery(undefined, {
    skip: !hasRefreshToken,
  });

  const user = data?.user;
  const membership = getActiveMembership(user, activeCompanyId);
  const permissions = membership?.effectivePermissions ?? [];

  return {
    user,
    membership,
    permissions,
    isLoading: isLoading || isFetching,
    hasPermission: (required: Permission) =>
      hasPermission(permissions, required),
    hasAnyPermission: (required: Permission[]) =>
      hasAnyPermission(permissions, required),
  };
}
