import type { ReactNode } from 'react';
import {
  Button,
  Tooltip,
  useMediaQuery,
  useTheme,
  type ButtonProps,
} from '@mui/material';

const COMPACT_SX = { minWidth: 40, px: 1 } as const;

export type ResponsiveIconButtonProps = Omit<
  ButtonProps,
  'startIcon' | 'children' | 'aria-label'
> & {
  label: string;
  icon: ReactNode;
};

export function ResponsiveIconButton({
  label,
  icon,
  sx,
  ...buttonProps
}: ResponsiveIconButtonProps) {
  const theme = useTheme();
  const isCompact = useMediaQuery(theme.breakpoints.down('sm'));

  const compactSx: ButtonProps['sx'] =
    sx == null
      ? COMPACT_SX
      : Array.isArray(sx)
        ? [COMPACT_SX, ...sx]
        : [COMPACT_SX, sx];

  return (
    <Tooltip title={isCompact ? label : ''}>
      <Button
        {...buttonProps}
        aria-label={label}
        startIcon={isCompact ? undefined : icon}
        sx={isCompact ? compactSx : sx}
      >
        {isCompact ? icon : label}
      </Button>
    </Tooltip>
  );
}
