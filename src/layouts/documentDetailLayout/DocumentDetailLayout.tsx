import type { ReactNode } from 'react';
import { Box, CircularProgress, Stack, Typography } from '@mui/material';

import { ApiErrorAlert } from '@/components/feedback/apiErrorAlert/ApiErrorAlert';
import { DocumentDetailActionsMenu } from './DocumentDetailActionsMenu';
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import type { SerializedError } from '@reduxjs/toolkit';
import { BackLink } from '@/components/navigation/backLink/BackLink';
import { PageShell, type PageShellMaxWidth } from '@/layouts/pageShell/PageShell';

interface DocumentDetailLayoutProps {
  title: string;
  titleAction?: ReactNode;
  subtitle?: string | null;
  statusBadge?: ReactNode;
  /** Menu items (DocumentActionMenuItem) + optional dialogs for the header ⋮ menu. */
  actionMenuItems?: ReactNode;
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
  actionMenuItems,
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
          direction="row"
          justifyContent="space-between"
          alignItems="flex-start"
          spacing={1}
        >
          <Box sx={{ minWidth: 0, flex: 1 }}>
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
            </Stack>
            {statusBadge ? <Box sx={{ mt: 1 }}>{statusBadge}</Box> : null}
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
          {actionMenuItems ? (
            <Box sx={{ flexShrink: 0, pt: 0.25 }}>
              <DocumentDetailActionsMenu>
                {actionMenuItems}
              </DocumentDetailActionsMenu>
            </Box>
          ) : null}
        </Stack>

        {children}
      </Stack>
    </PageShell>
  );
}
