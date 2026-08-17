import { describe, expect, it } from 'vitest';

import { extractQuoteLinesCsvRowErrors } from '@/features/quotes/lib/quoteLinesCsv';

describe('extractQuoteLinesCsvRowErrors', () => {
  it('reads row errors from QUOTE_LINES_CSV_INVALID details', () => {
    const rows = extractQuoteLinesCsvRowErrors({
      status: 400,
      data: {
        error: {
          code: 'QUOTE_LINES_CSV_INVALID',
          message: 'Invalid CSV',
          details: {
            rows: [
              { rowNumber: 2, errors: ['Quote line not found'] },
              { rowNumber: 4, errors: ['Duplicate quote line id'] },
            ],
          },
        },
      },
    });

    expect(rows).toEqual([
      { rowNumber: 2, errors: ['Quote line not found'] },
      { rowNumber: 4, errors: ['Duplicate quote line id'] },
    ]);
  });

  it('reads row errors from REQUEST_LINES_CSV_INVALID details', () => {
    const rows = extractQuoteLinesCsvRowErrors({
      status: 400,
      data: {
        error: {
          code: 'REQUEST_LINES_CSV_INVALID',
          message: 'Invalid CSV',
          details: {
            rows: [{ rowNumber: 3, errors: ['Invalid quantity'] }],
          },
        },
      },
    });

    expect(rows).toEqual([{ rowNumber: 3, errors: ['Invalid quantity'] }]);
  });

  it('returns null for other errors', () => {
    expect(
      extractQuoteLinesCsvRowErrors({
        status: 400,
        data: {
          error: {
            code: 'CSV_PARSE_ERROR',
            message: 'Bad CSV',
          },
        },
      }),
    ).toBeNull();
  });
});
