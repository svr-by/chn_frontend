import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';

import { useGetMeQuery } from '@/api/endpoints/authApi';
import { useAppDispatch } from '@/hooks/useAppDispatch';
import { useAppSelector } from '@/hooks/useAppSelector';
import { authStorage } from '@/lib/authStorage';
import {
  getActiveMemberships,
  resolveActiveCompanyId,
} from '@/lib/permissions';
import { setActiveCompanyId, setBootstrapped } from '@/store/slices/authSlice';

export function AuthBootstrap() {
  const dispatch = useAppDispatch();
  const isBootstrapped = useAppSelector((state) => state.auth.isBootstrapped);
  const activeCompanyId = useAppSelector((state) => state.auth.activeCompanyId);
  const hasRefreshToken = Boolean(authStorage.getRefreshToken());

  const { data, isLoading, isError, isUninitialized, isFetching } =
    useGetMeQuery(undefined, { skip: !hasRefreshToken });

  useEffect(() => {
    if (!hasRefreshToken) {
      dispatch(setBootstrapped(true));
      return;
    }

    if (isLoading || isUninitialized || isFetching) {
      return;
    }

    if (isError) {
      dispatch(setBootstrapped(true));
      return;
    }

    if (data?.user) {
      const activeMemberships = getActiveMemberships(data.user);
      const resolvedCompanyId = resolveActiveCompanyId(
        activeCompanyId,
        activeMemberships,
      );

      if (resolvedCompanyId !== activeCompanyId) {
        dispatch(setActiveCompanyId(resolvedCompanyId));
      }
    }

    dispatch(setBootstrapped(true));
  }, [
    activeCompanyId,
    data,
    dispatch,
    hasRefreshToken,
    isError,
    isFetching,
    isLoading,
    isUninitialized,
  ]);

  if (!isBootstrapped) {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return <Outlet />;
}
