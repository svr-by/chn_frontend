import { Typography, type TypographyProps } from '@mui/material';
import { useTranslation } from 'react-i18next';

import { formatDecimal } from '@/lib/decimal';
import { normalizeUiLocale } from '@/lib/supportedLocales';
import type { DecimalString } from '@/types/api';

interface DecimalDisplayProps extends Omit<TypographyProps, 'children'> {
  value: DecimalString | null | undefined;
  suffix?: string | null;
  fallback?: string;
  groupDigits?: boolean;
}

export function DecimalDisplay({
  value,
  suffix,
  fallback = '—',
  groupDigits = false,
  ...props
}: DecimalDisplayProps) {
  const { i18n } = useTranslation();

  if (value == null || value.trim() === '') {
    return (
      <Typography component="span" noWrap {...props}>
        {fallback}
      </Typography>
    );
  }

  const resolvedSuffix =
    suffix != null && suffix.trim() !== '' ? suffix.trim() : null;

  const formatted = formatDecimal(value, {
    groupDigits,
    locale: normalizeUiLocale(i18n.language),
  });

  return (
    <Typography component="span" noWrap {...props}>
      {resolvedSuffix ? `${formatted} ${resolvedSuffix}` : formatted}
    </Typography>
  );
}
