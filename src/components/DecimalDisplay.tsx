import { Typography, type TypographyProps } from '@mui/material';

import { formatDecimal } from '@/lib/decimal';
import type { DecimalString } from '@/types/api';

interface DecimalDisplayProps extends Omit<TypographyProps, 'children'> {
  value: DecimalString | null | undefined;
  fallback?: string;
}

export function DecimalDisplay({
  value,
  fallback = '—',
  ...props
}: DecimalDisplayProps) {
  if (value == null || value.trim() === '') {
    return (
      <Typography component="span" {...props}>
        {fallback}
      </Typography>
    );
  }

  return (
    <Typography component="span" {...props}>
      {formatDecimal(value)}
    </Typography>
  );
}
