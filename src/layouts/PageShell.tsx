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
  sx?: BoxProps['sx'];
}

export function PageShell({ children, maxWidth = 'xl', sx }: PageShellProps) {
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
        ...sx,
      }}
    >
      {children}
    </Box>
  );
}
