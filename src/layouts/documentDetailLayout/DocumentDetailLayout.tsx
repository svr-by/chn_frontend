import type { ReactNode } from 'react';
import {
  Box,
  CircularProgress,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';

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
  /** Visible primary/secondary actions next to the header ⋮ menu. */
  headerActions?: ReactNode;
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
  headerActions,
  actionMenuItems,
  meta,
  loading = false,
  error,
  backFallbackTo,
  maxWidth = 'xl',
  children,
}: DocumentDetailLayoutProps) {
  const theme = useTheme();
  const isCompact = useMediaQuery(theme.breakpoints.down('sm'));

  if (loading) {
    return (
      <PageShell maxWidth={maxWidth}>
        <Box display="flex" justifyContent="center" py={6}>
          <CircularProgress />
        </Box>
      </PageShell>
    );
  }

  const menu = actionMenuItems ? (
    <DocumentDetailActionsMenu>{actionMenuItems}</DocumentDetailActionsMenu>
  ) : null;
  const hasTitleRowActions =
    Boolean(actionMenuItems) || (!isCompact && Boolean(headerActions));

  return (
    <PageShell maxWidth={maxWidth}>
      <Stack spacing={3}>
        <BackLink to={backFallbackTo ?? '/app'} />

        <ApiErrorAlert error={error} />

        <Box>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="flex-start"
            spacing={1}
          >
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              flexWrap="wrap"
              sx={{ minWidth: 0, flex: 1 }}
            >
              <Typography variant="h5" component="h1">
                {title}
              </Typography>
              {titleAction ?? null}
            </Stack>
            {hasTitleRowActions ? (
              <Stack
                direction="row"
                spacing={1}
                alignItems="center"
                sx={{ flexShrink: 0, pt: 0.25 }}
              >
                {!isCompact ? (headerActions ?? null) : null}
                {menu}
              </Stack>
            ) : null}
          </Stack>
          {isCompact && headerActions ? (
            <Box
              sx={{
                mt: 1,
                '& .MuiButton-root': { width: '100%' },
              }}
            >
              {headerActions}
            </Box>
          ) : null}
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

        {children}
      </Stack>
    </PageShell>
  );
}
