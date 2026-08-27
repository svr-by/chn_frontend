import { describe, expect, it } from 'vitest';

import { getActivityEventTypeLabel } from '@/lib/activityEventLabels';

const t = ((key: string, options?: { defaultValue?: string }) => {
  const labels: Record<string, string> = {
    'enums:activityEventType.QUOTE_SUBMITTED': 'Quote submitted',
    'enums:activityEventType.REQUEST_DISTRIBUTED': 'Request distributed',
  };
  return labels[key] ?? options?.defaultValue ?? key;
}) as never;

describe('getActivityEventTypeLabel', () => {
  it('returns translated label for known event types', () => {
    expect(getActivityEventTypeLabel('QUOTE_SUBMITTED', t)).toBe(
      'Quote submitted',
    );
    expect(getActivityEventTypeLabel('REQUEST_DISTRIBUTED', t)).toBe(
      'Request distributed',
    );
  });

  it('falls back to the raw event type when missing', () => {
    expect(getActivityEventTypeLabel('UNKNOWN_EVENT', t)).toBe('UNKNOWN_EVENT');
  });
});
