import type { TFunction } from 'i18next';

import type { ActivityItem } from '@/api/generated/models/activityItem';
import { getActivityEventTypeLabel } from '@/lib/activityEventLabels';

export function getActivityItemLabel(item: ActivityItem, t: TFunction): string {
  if (item.source === 'comment' && item.body) {
    return item.body;
  }

  if (item.source === 'event' && item.eventType) {
    return getActivityEventTypeLabel(item.eventType, t);
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
