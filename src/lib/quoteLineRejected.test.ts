import { describe, expect, it } from 'vitest';

import { isQuoteLineRejected } from '@/lib/quoteLineRejected';

describe('isQuoteLineRejected', () => {
  it('returns true when rejectedAt is set', () => {
    expect(isQuoteLineRejected('2026-07-15T10:00:00.000Z')).toBe(true);
  });

  it('returns false for null or undefined', () => {
    expect(isQuoteLineRejected(null)).toBe(false);
    expect(isQuoteLineRejected(undefined)).toBe(false);
  });
});
