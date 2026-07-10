import { Navigate, Outlet, useLocation } from 'react-router-dom';

import { useGetMeQuery } from '@/api/endpoints/authApi';
import { useAppSelector } from '@/hooks/useAppSelector';
import { authStorage } from '@/lib/authStorage';
import {
  getActiveMemberships,
  hasSuspendedMemberships,
} from '@/lib/permissions';

interface ProtectedRouteProps {
  requireCompany?: boolean;
  allowSuspended?: boolean;
}

export function ProtectedRoute({
  requireCompany = true,
  allowSuspended = false,
}: ProtectedRouteProps) {
  const location = useLocation();
  const isBootstrapped = useAppSelector((state) => state.auth.isBootstrapped);
  const hasRefreshToken = Boolean(authStorage.getRefreshToken());
  const { data, isLoading, isFetching } = useGetMeQuery(undefined, {
    skip: !hasRefreshToken,
  });

  if (!isBootstrapped) {
    return null;
  }

  if (!hasRefreshToken) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (isLoading || isFetching) {
    return null;
  }

  const activeMemberships = getActiveMemberships(data?.user);
  const suspendedOnly =
    activeMemberships.length === 0 && hasSuspendedMemberships(data?.user);

  if (suspendedOnly && !allowSuspended) {
    return <Navigate to="/access-suspended" replace />;
  }

  if (requireCompany && activeMemberships.length === 0) {
    return <Navigate to="/onboarding" replace />;
  }

  return <Outlet />;
}
