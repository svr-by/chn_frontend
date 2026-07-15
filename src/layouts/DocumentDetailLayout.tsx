import type { ReactNode } from 'react';
import {
  Box,
  CircularProgress,
  Stack,
  Typography,
} from '@mui/material';

import { ApiErrorAlert } from '@/components/ApiErrorAlert';
import { BackLink } from '@/components/BackLink';
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import type { SerializedError } from '@reduxjs/toolkit';

interface DocumentDetailLayoutProps {
  title: string;
  subtitle?: string | null;
  statusBadge?: ReactNode;
  backTo?: string;
  backLabel?: string;
  actions?: ReactNode;
  meta?: ReactNode;
  loading?: boolean;
  error?: FetchBaseQueryError | SerializedError;
  children: ReactNode;
}

export function DocumentDetailLayout({
  title,
  subtitle,
  statusBadge,
  backTo,
  backLabel = 'Back',
  actions,
  meta,
  loading = false,
  error,
  children,
}: DocumentDetailLayoutProps) {
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" py={6}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Stack spacing={3}>
      {backTo ? <BackLink to={backTo}>{backLabel}</BackLink> : null}

      <ApiErrorAlert error={error} />

      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'stretch', sm: 'flex-start' }}
        spacing={2}
      >
        <Box>
          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
            <Typography variant="h5" component="h1">
              {title}
            </Typography>
            {statusBadge ?? null}
          </Stack>
          {subtitle ? (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {subtitle}
            </Typography>
          ) : null}
          {meta ? <Box sx={{ mt: 1 }}>{meta}</Box> : null}
        </Box>
        {actions ? (
          <Stack
            direction="row"
            spacing={1}
            flexWrap="wrap"
            sx={{
              width: { xs: '100%', sm: 'auto' },
              '& .MuiButton-root': {
                width: { xs: '100%', sm: 'auto' },
              },
            }}
          >
            {actions}
          </Stack>
        ) : null}
      </Stack>

      {children}
    </Stack>
  );
}
