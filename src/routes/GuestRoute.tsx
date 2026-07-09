import { Navigate, Outlet } from 'react-router-dom';

import { useGetMeQuery } from '@/api/endpoints/authApi';
import { useAppSelector } from '@/hooks/useAppSelector';
import { authStorage } from '@/lib/authStorage';
import {
  getActiveMemberships,
  isEmailVerified,
} from '@/lib/permissions';

export function GuestRoute() {
  const isBootstrapped = useAppSelector((state) => state.auth.isBootstrapped);
  const hasRefreshToken = Boolean(authStorage.getRefreshToken());
  const { data, isLoading, isFetching } = useGetMeQuery(undefined, {
    skip: !hasRefreshToken,
  });

  if (!isBootstrapped) {
    return null;
  }

  if (hasRefreshToken) {
    if (isLoading || isFetching) {
      return null;
    }

    if (data?.user && !isEmailVerified(data.user)) {
      return <Navigate to="/verify-email-prompt" replace />;
    }

    const activeMemberships = getActiveMemberships(data?.user);
    if (activeMemberships.length > 0) {
      return <Navigate to="/app" replace />;
    }

    return <Navigate to="/onboarding" replace />;
  }

  return <Outlet />;
}
