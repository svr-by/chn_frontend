import { Navigate, Outlet } from 'react-router-dom';

import { useGetMeQuery } from '@/api/endpoints/authApi';
import { useAppSelector } from '@/hooks/useAppSelector';
import { authStorage } from '@/lib/authStorage';
import { resolveAuthenticatedRedirect } from '@/lib/permissions';

export function GuestRoute() {
  const isBootstrapped = useAppSelector((state) => state.auth.isBootstrapped);
  const hasRefreshToken = Boolean(authStorage.getRefreshToken());
  const { data, isLoading, isError } = useGetMeQuery(undefined, {
    skip: !hasRefreshToken,
  });

  if (!isBootstrapped) {
    return null;
  }

  if (hasRefreshToken) {
    if (isLoading || isError || !data?.user) {
      return null;
    }

    return <Navigate to={resolveAuthenticatedRedirect(data.user)} replace />;
  }

  return <Outlet />;
}
