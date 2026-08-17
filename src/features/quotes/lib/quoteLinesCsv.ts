import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import type { SerializedError } from '@reduxjs/toolkit';

import { isApiError } from '@/api/baseApi';

export type QuoteLinesCsvRowError = {
  rowNumber: number;
  errors: string[];
};

export function extractQuoteLinesCsvRowErrors(
  error: FetchBaseQueryError | SerializedError | undefined,
): QuoteLinesCsvRowError[] | null {
  if (!error || !('data' in error) || !isApiError(error.data)) {
    return null;
  }

  const csvInvalidCodes = new Set([
    'QUOTE_LINES_CSV_INVALID',
    'REQUEST_LINES_CSV_INVALID',
  ]);
  if (!csvInvalidCodes.has(error.data.error.code)) {
    return null;
  }

  const details = error.data.error.details;
  if (
    !details ||
    typeof details !== 'object' ||
    !('rows' in details) ||
    !Array.isArray((details as { rows: unknown }).rows)
  ) {
    return null;
  }

  const rows = (details as { rows: unknown[] }).rows
    .map((row) => {
      if (
        !row ||
        typeof row !== 'object' ||
        !('rowNumber' in row) ||
        !('errors' in row) ||
        typeof (row as { rowNumber: unknown }).rowNumber !== 'number' ||
        !Array.isArray((row as { errors: unknown }).errors)
      ) {
        return null;
      }

      return {
        rowNumber: (row as { rowNumber: number }).rowNumber,
        errors: (row as { errors: unknown[] }).errors.filter(
          (item): item is string => typeof item === 'string',
        ),
      };
    })
    .filter((row): row is QuoteLinesCsvRowError => row != null);

  return rows.length > 0 ? rows : null;
}
