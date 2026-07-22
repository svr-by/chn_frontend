import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Box, Button, CircularProgress, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

import { useGetMeQuery } from '@/api/endpoints/authApi';
import { useAppDispatch } from '@/hooks/useAppDispatch';
import { useAppSelector } from '@/hooks/useAppSelector';
import { authStorage } from '@/lib/authStorage';
import {
  getSwitcherMemberships,
  resolveActiveCompanyId,
} from '@/lib/permissions';
import { setActiveCompanyId, setBootstrapped } from '@/store/slices/authSlice';

function BootstrapSpinner() {
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

export function AuthBootstrap() {
  const { t } = useTranslation('common');
  const dispatch = useAppDispatch();
  const isBootstrapped = useAppSelector((state) => state.auth.isBootstrapped);
  const activeCompanyId = useAppSelector((state) => state.auth.activeCompanyId);
  const hasRefreshToken = Boolean(authStorage.getRefreshToken());

  const { data, isLoading, isError, isUninitialized, isFetching, refetch } =
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
      const switcherMemberships = getSwitcherMemberships(data.user);
      const resolvedCompanyId = resolveActiveCompanyId(
        activeCompanyId,
        switcherMemberships,
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

  if (!isBootstrapped || (hasRefreshToken && isFetching && !data)) {
    return <BootstrapSpinner />;
  }

  // Don't mount authenticated routes while /auth/me failed — remounting those
  // subscribers on every refetch was hammering the API when the backend is down.
  if (hasRefreshToken && isError) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 2,
          minHeight: '100vh',
          px: 2,
        }}
      >
        <Typography color="text.secondary" textAlign="center">
          {t('app.sessionLoadFailed')}
        </Typography>
        <Button variant="contained" onClick={() => void refetch()}>
          {t('app.retry')}
        </Button>
      </Box>
    );
  }

  return <Outlet />;
}
