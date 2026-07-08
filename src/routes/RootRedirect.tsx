import { Navigate } from 'react-router-dom';

import { useGetMeQuery } from '@/api/endpoints/authApi';
import { useAppSelector } from '@/hooks/useAppSelector';
import { authStorage } from '@/lib/authStorage';
import { getActiveMemberships } from '@/lib/permissions';

export function RootRedirect() {
  const isBootstrapped = useAppSelector((state) => state.auth.isBootstrapped);
  const hasRefreshToken = Boolean(authStorage.getRefreshToken());
  const { data } = useGetMeQuery(undefined, { skip: !hasRefreshToken });

  if (!isBootstrapped) {
    return null;
  }

  if (!hasRefreshToken) {
    return <Navigate to="/login" replace />;
  }

  const activeMemberships = getActiveMemberships(data?.user);
  if (activeMemberships.length === 0) {
    return <Navigate to="/onboarding" replace />;
  }

  return <Navigate to="/app" replace />;
}
