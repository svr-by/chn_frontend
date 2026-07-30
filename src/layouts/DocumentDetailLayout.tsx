import type { ReactNode } from 'react';
import { Box, CircularProgress, Stack, Typography } from '@mui/material';

import { ApiErrorAlert } from '@/components/ApiErrorAlert';
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import type { SerializedError } from '@reduxjs/toolkit';
import { BackLink } from '@/components/BackLink';
import { PageShell, type PageShellMaxWidth } from '@/layouts/PageShell';

interface DocumentDetailLayoutProps {
  title: string;
  titleAction?: ReactNode;
  subtitle?: string | null;
  statusBadge?: ReactNode;
  actions?: ReactNode;
  meta?: ReactNode;
  loading?: boolean;
  error?: FetchBaseQueryError | SerializedError;
  backFallbackTo?: string;
  /** Defaults to `xl`. Use `fluid` for wide matrices. */
  maxWidth?: PageShellMaxWidth;
  children: ReactNode;
}

export function DocumentDetailLayout({
  title,
  titleAction,
  subtitle,
  statusBadge,
  actions,
  meta,
  loading = false,
  error,
  backFallbackTo,
  maxWidth = 'xl',
  children,
}: DocumentDetailLayoutProps) {
  if (loading) {
    return (
      <PageShell maxWidth={maxWidth}>
        <Box display="flex" justifyContent="center" py={6}>
          <CircularProgress />
        </Box>
      </PageShell>
    );
  }

  return (
    <PageShell maxWidth={maxWidth}>
      <Stack spacing={3}>
        <BackLink to={backFallbackTo ?? '/app'} />

        <ApiErrorAlert error={error} />

        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'stretch', sm: 'flex-start' }}
          spacing={2}
        >
          <Box>
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              flexWrap="wrap"
            >
              <Typography variant="h5" component="h1">
                {title}
              </Typography>
              {titleAction ?? null}
              {statusBadge ?? null}
            </Stack>
            {subtitle ? (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 0.5 }}
              >
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
    </PageShell>
  );
}
