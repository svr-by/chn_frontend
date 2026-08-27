import type { TFunction } from 'i18next';

import type { DocumentRelationshipsNodesItemDocumentType } from '@/api/generated/models/documentRelationshipsNodesItemDocumentType';
import type { LineageEvent } from '@/api/generated/models/lineageEvent';
import type { TraceSearchItemPipelineStatus } from '@/api/generated/models/traceSearchItemPipelineStatus';
import { getActivityEventTypeLabel } from '@/lib/activityEventLabels';
import type { PipelineStage } from '@/lib/lineagePipeline';

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

const PIPELINE_STAGE_STATUS_ENUM_KEYS = {
  request: 'materialRequestStatus',
  quotes: 'supplierQuoteStatus',
  invoices: 'supplierInvoiceStatus',
  shipments: 'shippingInvoiceStatus',
  consolidations: 'consolidationStatus',
} as const satisfies Record<PipelineStage, string>;

function translateEnumStatus(
  enumKey: string,
  status: string,
  t: TFunction,
): string | null {
  const statusKey = status.toLowerCase();
  const key = `enums:${enumKey}.${statusKey}`;
  const translated = t(key);
  if (translated === key || translated === `${enumKey}.${statusKey}`) {
    return null;
  }
  return translated;
}

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

  return translateEnumStatus(enumKey, status, t) ?? status;
}

export function getPipelineItemStatusLabel(
  stage: PipelineStage,
  status: string,
  t: TFunction,
): string {
  const fromEnum = translateEnumStatus(
    PIPELINE_STAGE_STATUS_ENUM_KEYS[stage],
    status,
    t,
  );
  if (fromEnum) {
    return fromEnum;
  }

  const statusKey = status.toLowerCase();
  const pipelineKey = `trace:pipelineStatus.${statusKey}`;
  const pipelineTranslated = t(pipelineKey);
  if (pipelineTranslated !== pipelineKey) {
    return pipelineTranslated;
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

export function getLineageEventLabel(
  event: LineageEvent,
  t: TFunction,
): string {
  return getActivityEventTypeLabel(event.eventType, t);
}

export function getLineageEventActorName(
  event: LineageEvent,
  t: TFunction,
): string {
  return event.actor?.name ?? t('collaboration:activity.systemActor');
}
