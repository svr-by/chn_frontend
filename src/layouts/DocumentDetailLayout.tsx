import type { ReactNode } from 'react';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import {
  Box,
  Button,
  CircularProgress,
  Stack,
  Typography,
} from '@mui/material';

import { ApiErrorAlert } from '@/components/ApiErrorAlert';
import { useSafeAppBack } from '@/hooks/useSafeAppBack';
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import type { SerializedError } from '@reduxjs/toolkit';
import { useTranslation } from 'react-i18next';

interface DocumentDetailLayoutProps {
  title: string;
  subtitle?: string | null;
  statusBadge?: ReactNode;
  actions?: ReactNode;
  meta?: ReactNode;
  loading?: boolean;
  error?: FetchBaseQueryError | SerializedError;
  backFallbackTo?: string;
  children: ReactNode;
}

export function DocumentDetailLayout({
  title,
  subtitle,
  statusBadge,
  actions,
  meta,
  loading = false,
  error,
  backFallbackTo,
  children,
}: DocumentDetailLayoutProps) {
  const handleBack = useSafeAppBack(backFallbackTo ?? '/app');
  const { t } = useTranslation('common');

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" py={6}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Stack spacing={3}>
      <Button
        variant="text"
        startIcon={<ArrowBackIcon fontSize="small" />}
        onClick={handleBack}
        sx={{ alignSelf: 'flex-start' }}
      >
        {t('app.backButton')}
      </Button>

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
