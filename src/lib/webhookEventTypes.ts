import { ActivityItemEventType } from '@/api/generated/models/activityItemEventType';

export const WEBHOOK_EVENT_TYPES = [
  ActivityItemEventType.QUOTE_LINE_SELECTED,
  ActivityItemEventType.QUOTE_LINE_SELECTION_UPDATED,
  ActivityItemEventType.QUOTE_LINE_UNSELECTED,
  ActivityItemEventType.INVOICE_CREATED,
  ActivityItemEventType.INVOICE_ISSUED,
  ActivityItemEventType.INVOICE_CONFIRMED,
  ActivityItemEventType.PAYMENT_REGISTERED,
  ActivityItemEventType.PAYMENT_CONFIRMED,
  ActivityItemEventType.PAYMENT_REJECTED,
  ActivityItemEventType.SHIPPING_INVOICE_CREATED,
  ActivityItemEventType.SHIPPING_INVOICE_ISSUED,
  ActivityItemEventType.SHIPPING_INVOICE_IN_TRANSIT,
  ActivityItemEventType.SHIPPING_INVOICE_DELIVERED,
  ActivityItemEventType.CONSOLIDATION_CREATED,
  ActivityItemEventType.CONSOLIDATION_PLANNED,
  ActivityItemEventType.CONSOLIDATION_IN_TRANSIT,
  ActivityItemEventType.CONSOLIDATION_CUSTOMS,
  ActivityItemEventType.CONSOLIDATION_DELIVERED,
  ActivityItemEventType.REQUEST_IMPORTED_FROM_INTEGRATION,
  ActivityItemEventType.REQUEST_UPDATED_FROM_INTEGRATION,
] as const;

export type WebhookEventType = (typeof WEBHOOK_EVENT_TYPES)[number];
