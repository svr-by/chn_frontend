import { describe, expect, it } from 'vitest';

import {
  getNotificationTitle,
  resolveActivityEventTypeFromTitle,
} from '@/lib/notificationLabels';
import { createNotification } from '@/test/fixtures';

const t = ((key: string, options?: { defaultValue?: string }) => {
  const labels: Record<string, string> = {
    'enums:activityEventType.QUOTE_SUBMITTED':
      'Коммерческое предложение отправлено',
    'enums:activityEventType.REQUEST_DISTRIBUTED': 'Заявка разослана',
    'notifications:titles.COMMENT_ADDED': 'Новый комментарий к документу',
    'notifications:titles.PARTNER_INVITATION_RECEIVED':
      'Получено приглашение партнёра',
  };
  return labels[key] ?? options?.defaultValue ?? key;
}) as never;

describe('resolveActivityEventTypeFromTitle', () => {
  it('resolves exact English activity titles', () => {
    expect(resolveActivityEventTypeFromTitle('Quote submitted')).toBe(
      'QUOTE_SUBMITTED',
    );
  });

  it('resolves titles that contain a known English label', () => {
    expect(
      resolveActivityEventTypeFromTitle('Request distributed to suppliers'),
    ).toBe('REQUEST_DISTRIBUTED');
  });

  it('returns null for free-form titles', () => {
    expect(resolveActivityEventTypeFromTitle('New comment on invoice')).toBe(
      null,
    );
  });
});

describe('getNotificationTitle', () => {
  it('translates known English titles via activity event enums', () => {
    const notification = createNotification({
      type: 'DOCUMENT_STATUS_CHANGED',
      documentEventId: '434d1df9-4fb2-4e70-aadb-31ef515276e0',
      title: 'Quote submitted',
    });

    expect(getNotificationTitle(notification, t)).toBe(
      'Коммерческое предложение отправлено',
    );
  });

  it('translates COMMENT_ADDED by notification type', () => {
    const notification = createNotification({
      type: 'COMMENT_ADDED',
      title: 'New comment on invoice',
    });

    expect(getNotificationTitle(notification, t)).toBe(
      'Новый комментарий к документу',
    );
  });

  it('translates PARTNER_INVITATION_RECEIVED by notification type', () => {
    const notification = createNotification({
      type: 'PARTNER_INVITATION_RECEIVED',
      title: 'Partner invitation',
    });

    expect(getNotificationTitle(notification, t)).toBe(
      'Получено приглашение партнёра',
    );
  });

  it('does not treat documentEventId UUID as an event type', () => {
    const notification = createNotification({
      type: 'DOCUMENT_STATUS_CHANGED',
      documentEventId: '434d1df9-4fb2-4e70-aadb-31ef515276e0',
      title: 'Some custom status title',
    });

    expect(getNotificationTitle(notification, t)).toBe(
      'Some custom status title',
    );
  });

  it('falls back to API title when unrecognized', () => {
    const notification = createNotification({
      type: 'DOCUMENT_STATUS_CHANGED',
      documentEventId: null,
      title: 'Custom backend title',
    });

    expect(getNotificationTitle(notification, t)).toBe('Custom backend title');
  });
});
