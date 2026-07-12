import { describe, expect, it } from 'vitest';

import {
  getActivityItemActorName,
  getActivityItemLabel,
} from '@/lib/activityLabels';
import { createActivityItem } from '@/test/fixtures';

const t = ((key: string) => {
  const labels: Record<string, string> = {
    'enums:activityEventType.INVOICE_ISSUED': 'Invoice issued',
    'collaboration:activity.systemActor': 'System',
    'collaboration:activity.unknownEvent': 'Activity recorded',
  };
  return labels[key] ?? key;
}) as never;

describe('getActivityItemLabel', () => {
  it('returns comment body for comment source', () => {
    const item = createActivityItem({
      source: 'comment',
      body: 'Need an update',
      eventType: undefined,
    });

    expect(getActivityItemLabel(item, t)).toBe('Need an update');
  });

  it('returns translated event label for event source', () => {
    const item = createActivityItem({
      source: 'event',
      eventType: 'INVOICE_ISSUED',
      body: undefined,
    });

    expect(getActivityItemLabel(item, t)).toBe('Invoice issued');
  });
});

describe('getActivityItemActorName', () => {
  it('falls back to system actor label', () => {
    const item = createActivityItem({ actor: null });
    expect(getActivityItemActorName(item, t)).toBe('System');
  });
});
