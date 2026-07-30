import { Typography, type TypographyProps } from '@mui/material';

import { formatDecimal } from '@/lib/decimal';
import type { DecimalString } from '@/types/api';

interface DecimalWithSuffixProps extends Omit<TypographyProps, 'children'> {
  value: DecimalString | null | undefined;
  suffix?: string | null;
  fallback?: string;
}

export function DecimalWithSuffix({
  value,
  suffix,
  fallback = '—',
  ...props
}: DecimalWithSuffixProps) {
  if (value == null || value.trim() === '') {
    return (
      <Typography component="span" {...props}>
        {fallback}
      </Typography>
    );
  }

  const resolvedSuffix =
    suffix != null && suffix.trim() !== '' ? suffix.trim() : null;

  return (
    <Typography component="span" {...props}>
      {resolvedSuffix
        ? `${formatDecimal(value)} ${resolvedSuffix}`
        : formatDecimal(value)}
    </Typography>
  );
}
