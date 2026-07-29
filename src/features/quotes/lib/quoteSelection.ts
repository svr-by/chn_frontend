import type { MaterialRequestStatus } from '@/api/generated/models/materialRequestStatus';
import type { SupplierQuoteStatus } from '@/api/generated/models/supplierQuoteStatus';

export const SELECTABLE_QUOTE_STATUSES = new Set<SupplierQuoteStatus>([
  'SUBMITTED',
  'PARTIALLY_ACCEPTED',
  'ACCEPTED',
]);

export const SELECTABLE_REQUEST_STATUSES = new Set<MaterialRequestStatus>([
  'QUOTING',
  'PARTIALLY_ORDERED',
  'ORDERED',
]);

export function isQuoteLineSelectionAllowed(
  quoteStatus: SupplierQuoteStatus,
  requestStatus: MaterialRequestStatus | undefined,
): boolean {
  return (
    SELECTABLE_QUOTE_STATUSES.has(quoteStatus) &&
    requestStatus != null &&
    SELECTABLE_REQUEST_STATUSES.has(requestStatus)
  );
}

export const SUPPLIER_EDITABLE_QUOTE_STATUSES = new Set<SupplierQuoteStatus>([
  'DRAFT',
  'SUBMITTED',
  'PARTIALLY_ACCEPTED',
  'ACCEPTED',
]);
