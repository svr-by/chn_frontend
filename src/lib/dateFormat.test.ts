import { describe, expect, it } from 'vitest';

import {
  formatLocalizedDate,
  formatLocalizedDateTime,
} from '@/lib/dateFormat';

describe('dateFormat helpers', () => {
  const iso = '2026-01-15T13:45:00.000Z';

  it('formats dates using the normalized UI locale', () => {
    expect(formatLocalizedDate(iso, 'ru-RU')).toBe(
      new Date(iso).toLocaleDateString('ru'),
    );
    expect(formatLocalizedDate(iso, 'zh-Hans')).toBe(
      new Date(iso).toLocaleDateString('zh-CN'),
    );
    expect(formatLocalizedDate(iso, 'en-US')).toBe(
      new Date(iso).toLocaleDateString('en'),
    );
  });

  it('formats date-times using the normalized UI locale', () => {
    expect(formatLocalizedDateTime(iso, 'ru-RU')).toBe(
      new Date(iso).toLocaleString('ru'),
    );
  });

  it('returns a placeholder for empty or invalid values', () => {
    expect(formatLocalizedDate(null, 'en')).toBe('—');
    expect(formatLocalizedDate('not-a-date', 'en')).toBe('—');
    expect(formatLocalizedDateTime(undefined, 'en')).toBe('—');
    expect(formatLocalizedDateTime('not-a-date', 'en')).toBe('—');
  });
});
