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

export interface FormatDecimalOptions {
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
}

export function formatDecimal(
  value: DecimalString,
  options: FormatDecimalOptions = {},
): string {
  const { minimumFractionDigits = 0, maximumFractionDigits = 4 } = options;
  const decimal = parseDecimal(value);

  return decimal.toFixed(
    Math.max(minimumFractionDigits, Math.min(maximumFractionDigits, countFractionDigits(value))),
    Decimal.ROUND_HALF_UP,
  );
}

function countFractionDigits(value: string): number {
  const parts = value.trim().split('.');
  return parts.length > 1 ? parts[1].length : 0;
}
