import { Navigate, Outlet, useLocation } from 'react-router-dom';

import { useAppSelector } from '@/hooks/useAppSelector';
import { authStorage } from '@/lib/authStorage';
import { getActiveMemberships } from '@/lib/permissions';
import { useGetMeQuery } from '@/api/endpoints/authApi';

interface ProtectedRouteProps {
  requireCompany?: boolean;
}

export function ProtectedRoute({ requireCompany = true }: ProtectedRouteProps) {
  const location = useLocation();
  const isBootstrapped = useAppSelector((state) => state.auth.isBootstrapped);
  const hasRefreshToken = Boolean(authStorage.getRefreshToken());
  const { data } = useGetMeQuery(undefined, { skip: !hasRefreshToken });

  if (!isBootstrapped) {
    return null;
  }

  if (!hasRefreshToken) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requireCompany) {
    const activeMemberships = getActiveMemberships(data?.user);
    if (activeMemberships.length === 0) {
      return <Navigate to="/onboarding" replace />;
    }
  }

  return <Outlet />;
}
