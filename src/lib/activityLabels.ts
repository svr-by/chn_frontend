import type { TFunction } from 'i18next';

import type { ActivityItem } from '@/api/generated/models/activityItem';

export function getActivityItemLabel(item: ActivityItem, t: TFunction): string {
  if (item.source === 'comment' && item.body) {
    return item.body;
  }

  if (item.source === 'event' && item.eventType) {
    const key = `enums:activityEventType.${item.eventType}`;
    const translated = t(key);
    if (translated !== key) {
      return translated;
    }
    return item.eventType;
  }

  if (item.body) {
    return item.body;
  }

  return t('collaboration:activity.unknownEvent');
}

export function getActivityItemActorName(
  item: ActivityItem,
  t: TFunction,
): string {
  return item.actor?.name ?? t('collaboration:activity.systemActor');
}
