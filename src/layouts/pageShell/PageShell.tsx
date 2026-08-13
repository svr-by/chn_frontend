import type { ReactNode } from 'react';
import { Box, type BoxProps } from '@mui/material';

/** Soft content widths for app pages (px). `fluid` leaves width unconstrained. */
export const PAGE_SHELL_MAX_WIDTH = {
  sm: 720,
  md: 960,
  lg: 1200,
  xl: 1440,
  fluid: false,
} as const;

export type PageShellMaxWidth = keyof typeof PAGE_SHELL_MAX_WIDTH;

export interface PageShellProps {
  children: ReactNode;
  /**
   * Content width ceiling.
   * - `md` — forms / create flows
   * - `lg` — settings and compact content
   * - `xl` — lists and most document details (default)
   * - `fluid` — wide matrices / unconstrained tables
   */
  maxWidth?: PageShellMaxWidth;
  /**
   * Stretch to the remaining viewport below the fixed app bar
   * (matches AppLayout toolbar + main padding). Useful for list pages
   * that pin footer controls with `mt: 'auto'`.
   */
  fillViewport?: boolean;
  sx?: BoxProps['sx'];
}

export function PageShell({
  children,
  maxWidth = 'xl',
  fillViewport = false,
  sx,
}: PageShellProps) {
  const resolvedMaxWidth = PAGE_SHELL_MAX_WIDTH[maxWidth];

  return (
    <Box
      data-testid="page-shell"
      data-max-width={maxWidth}
      sx={{
        width: '100%',
        ...(resolvedMaxWidth === false
          ? {}
          : { maxWidth: resolvedMaxWidth, mx: 'auto' }),
        ...(fillViewport
          ? {
              display: 'flex',
              flexDirection: 'column',
              // AppBar: 56/64px; main padding: theme spacing 2/3 on each side
              minHeight: {
                xs: 'calc(100vh - 56px - 32px)',
                sm: 'calc(100vh - 64px - 48px)',
              },
            }
          : {}),
        ...sx,
      }}
    >
      {children}
    </Box>
  );
}
