import Decimal from 'decimal.js';

import type { DecimalString } from '@/types/api';

export type { DecimalString };

export const DECIMAL_PATTERN = /^\d+(\.\d{1,4})?$/;

export function isValidDecimal(value: string): boolean {
  return DECIMAL_PATTERN.test(value.trim());
}

export function parseDecimal(value: string): Decimal {
  return new Decimal(value.trim());
}

export function isDecimalLte(a: string, b: string): boolean {
  return parseDecimal(a).lte(parseDecimal(b));
}

export function isDecimalGte(a: string, b: string): boolean {
  return parseDecimal(a).gte(parseDecimal(b));
}

export interface FormatDecimalOptions {
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
  groupDigits?: boolean;
  locale?: string;
}

function groupIntegerDigits(integerPart: string, locale: string): string {
  const normalized = integerPart.replace(/^0+(?=\d)/, '') || '0';

  try {
    return new Intl.NumberFormat(locale, {
      useGrouping: true,
      maximumFractionDigits: 0,
    }).format(BigInt(normalized));
  } catch {
    return normalized;
  }
}

export function formatDecimal(
  value: DecimalString,
  options: FormatDecimalOptions = {},
): string {
  const {
    minimumFractionDigits = 0,
    maximumFractionDigits = 4,
    groupDigits = false,
    locale = 'en',
  } = options;
  const decimal = parseDecimal(value);

  const formatted = decimal.toFixed(
    Math.max(
      minimumFractionDigits,
      Math.min(maximumFractionDigits, countFractionDigits(value)),
    ),
    Decimal.ROUND_HALF_UP,
  );

  if (!groupDigits) {
    return formatted;
  }

  const [integerPart, fractionPart] = formatted.split('.');
  const groupedInteger = groupIntegerDigits(integerPart, locale);

  return fractionPart != null
    ? `${groupedInteger}.${fractionPart}`
    : groupedInteger;
}

function countFractionDigits(value: string): number {
  const parts = value.trim().split('.');
  return parts.length > 1 ? parts[1].length : 0;
}
