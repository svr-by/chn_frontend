import type { TFunction } from 'i18next';

import type { DocumentRelationshipsNodesItemDocumentType } from '@/api/generated/models/documentRelationshipsNodesItemDocumentType';
import type { LineageEvent } from '@/api/generated/models/lineageEvent';
import type { TraceSearchItemPipelineStatus } from '@/api/generated/models/traceSearchItemPipelineStatus';

const DOCUMENT_STATUS_ENUM_KEYS = {
  MATERIAL_REQUEST: 'materialRequestStatus',
  SUPPLIER_QUOTE: 'supplierQuoteStatus',
  INVOICE: 'supplierInvoiceStatus',
  PAYMENT: 'paymentStatus',
  SHIPPING_INVOICE: 'shippingInvoiceStatus',
  CONSOLIDATION: 'consolidationStatus',
} as const satisfies Record<
  DocumentRelationshipsNodesItemDocumentType,
  string
>;

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

export function getDocumentStatusLabel(
  documentType: DocumentRelationshipsNodesItemDocumentType,
  status: string,
  t: TFunction,
): string {
  const enumKey = DOCUMENT_STATUS_ENUM_KEYS[documentType];
  if (!enumKey) {
    return status;
  }

  const statusKey = status.toLowerCase();
  const key = `enums:${enumKey}.${statusKey}`;
  const translated = t(key);
  if (translated === key || translated === `${enumKey}.${statusKey}`) {
    return status;
  }

  return translated;
}

export function getRelationLabel(relation: string, t: TFunction): string {
  const key = `trace:relations.${relation}`;
  const translated = t(key);
  if (translated === key || translated === `relations.${relation}`) {
    return relation;
  }

  return translated;
}

export function getLineageEventLabel(
  event: LineageEvent,
  t: TFunction,
): string {
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
