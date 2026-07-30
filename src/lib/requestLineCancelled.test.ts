import { describe, expect, it } from 'vitest';

import { isRequestLineCancelled } from '@/lib/requestLineCancelled';

describe('isRequestLineCancelled', () => {
  it('returns true when cancelledAt is set', () => {
    expect(isRequestLineCancelled('2026-07-15T10:00:00.000Z')).toBe(true);
  });

  it('returns false for null or undefined', () => {
    expect(isRequestLineCancelled(null)).toBe(false);
    expect(isRequestLineCancelled(undefined)).toBe(false);
  });
});
