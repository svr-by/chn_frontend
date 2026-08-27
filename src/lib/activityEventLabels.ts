import type { TFunction } from 'i18next';

/**
 * Translates a document/activity event type via `enums:activityEventType.*`.
 * Falls back to the raw event type when no locale key exists.
 */
export function getActivityEventTypeLabel(
  eventType: string,
  t: TFunction,
): string {
  return t(`enums:activityEventType.${eventType}`, {
    defaultValue: eventType,
  });
}
