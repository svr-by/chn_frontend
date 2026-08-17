import { describe, expect, it } from 'vitest';

import { formatDecimal } from '@/lib/decimal';

describe('formatDecimal', () => {
  it('groups integer digits when requested', () => {
    expect(
      formatDecimal('1234567.89', { groupDigits: true, locale: 'en' }),
    ).toBe('1,234,567.89');
  });

  it('uses locale-specific grouping separators', () => {
    expect(
      formatDecimal('1234567.89', { groupDigits: true, locale: 'ru' }),
    ).toBe('1\u00A0234\u00A0567.89');
  });

  it('preserves fractional precision without grouping by default', () => {
    expect(formatDecimal('1000.5')).toBe('1000.5');
  });
});
