import type { TFunction } from 'i18next';

import type { LineageEvent } from '@/api/generated/models/lineageEvent';
import type { TraceSearchItemPipelineStatus } from '@/api/generated/models/traceSearchItemPipelineStatus';

export function getPipelineStatusLabel(
  status: TraceSearchItemPipelineStatus,
  t: TFunction,
): string {
  if (!status) {
    return t('trace:pipelineStatus.unknown');
  }

  const key = `trace:pipelineStatus.${status}`;
  const translated = t(key);
  if (translated !== key) {
    return translated;
  }

  return status;
}

export function getRelationLabel(relation: string, t: TFunction): string {
  const key = `trace:relations.${relation}`;
  const translated = t(key);
  if (translated === key || translated === `relations.${relation}`) {
    return relation;
  }

  return translated;
}

export function getLineageEventLabel(event: LineageEvent, t: TFunction): string {
  const key = `enums:activityEventType.${event.eventType}`;
  const translated = t(key);
  if (translated !== key) {
    return translated;
  }

  return event.eventType;
}

export function getLineageEventActorName(
  event: LineageEvent,
  t: TFunction,
): string {
  return event.actor?.name ?? t('collaboration:activity.systemActor');
}
