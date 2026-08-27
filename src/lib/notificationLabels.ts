import type { TFunction } from 'i18next';

import { ActivityItemEventType } from '@/api/generated/models/activityItemEventType';
import type { Notification } from '@/api/generated/models/notification';
import { NotificationType } from '@/api/generated/models/notificationType';
import { getActivityEventTypeLabel } from '@/lib/activityEventLabels';
import enEnums from '@/locales/en/enums.json';

type ActivityEventType = (typeof ActivityItemEventType)[keyof typeof ActivityItemEventType];

const ACTIVITY_EVENT_LABELS = Object.entries(
  enEnums.activityEventType,
).filter(([key]) =>
  Object.prototype.hasOwnProperty.call(ActivityItemEventType, key),
) as Array<[ActivityEventType, string]>;

const TYPED_NOTIFICATION_TITLE_TYPES = new Set<string>([
  NotificationType.COMMENT_ADDED,
  NotificationType.PARTNER_INVITATION_RECEIVED,
]);

/**
 * Maps an English API notification title to a known activity event type.
 * Prefers exact match, then the longest English label contained in the title
 * (e.g. "Request distributed to suppliers" → REQUEST_DISTRIBUTED).
 */
export function resolveActivityEventTypeFromTitle(
  title: string,
): ActivityEventType | null {
  const normalized = title.trim().toLowerCase();
  if (!normalized) {
    return null;
  }

  for (const [key, label] of ACTIVITY_EVENT_LABELS) {
    if (label.toLowerCase() === normalized) {
      return key;
    }
  }

  let best: { key: ActivityEventType; length: number } | null = null;
  for (const [key, label] of ACTIVITY_EVENT_LABELS) {
    const needle = label.toLowerCase();
    if (
      normalized.includes(needle) &&
      needle.length > (best?.length ?? 0)
    ) {
      best = { key, length: needle.length };
    }
  }

  return best?.key ?? null;
}

/**
 * Prefer type-based titles for comment/invitation notifications, then
 * translate known English activity-event titles via enums; otherwise show
 * the API-provided title as-is.
 *
 * Note: `documentEventId` is a UUID of the document event row, not an event type.
 */
export function getNotificationTitle(
  notification: Notification,
  t: TFunction,
): string {
  if (TYPED_NOTIFICATION_TITLE_TYPES.has(notification.type)) {
    const key = `notifications:titles.${notification.type}`;
    const translated = t(key, { defaultValue: notification.title });
    if (translated !== key) {
      return translated;
    }
  }

  const eventType = resolveActivityEventTypeFromTitle(notification.title);
  if (eventType) {
    return getActivityEventTypeLabel(eventType, t);
  }

  return notification.title;
}
