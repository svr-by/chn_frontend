import type { ReactNode } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  CircularProgress,
  Link,
  Stack,
  Typography,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

import { ApiErrorAlert } from '@/components/ApiErrorAlert';
import { StatusBadge } from '@/components/StatusBadge';
import type { MaterialRequestStatus } from '@/types/api';
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import type { SerializedError } from '@reduxjs/toolkit';

interface DocumentDetailLayoutProps {
  title: string;
  subtitle?: string | null;
  status?: MaterialRequestStatus;
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
  status,
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
      {backTo ? (
        <Link
          component={RouterLink}
          to={backTo}
          underline="hover"
          sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}
        >
          <ArrowBackIcon fontSize="small" />
          {backLabel}
        </Link>
      ) : null}

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
            {status ? <StatusBadge status={status} /> : null}
          </Stack>
          {subtitle ? (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {subtitle}
            </Typography>
          ) : null}
          {meta ? <Box sx={{ mt: 1 }}>{meta}</Box> : null}
        </Box>
        {actions ? (
          <Stack direction="row" spacing={1} flexWrap="wrap">
            {actions}
          </Stack>
        ) : null}
      </Stack>

      {children}
    </Stack>
  );
}
