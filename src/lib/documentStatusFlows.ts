import type { ChipProps } from '@mui/material';

import { ConsolidationStatus } from '@/api/generated/models/consolidationStatus';
import { MaterialRequestStatus } from '@/api/generated/models/materialRequestStatus';
import { PaymentStatus } from '@/api/generated/models/paymentStatus';
import { ShippingInvoiceStatus } from '@/api/generated/models/shippingInvoiceStatus';
import { SupplierInvoiceStatus } from '@/api/generated/models/supplierInvoiceStatus';
import { SupplierQuoteStatus } from '@/api/generated/models/supplierQuoteStatus';

export type DocumentStatusChipColor = NonNullable<ChipProps['color']>;

export interface DocumentStatusStep<T extends string = string> {
  value: T;
  color: DocumentStatusChipColor;
}

/** i18n key under `enums` namespace, e.g. `materialRequestStatus`. */
export type DocumentStatusEnumKey =
  | 'materialRequestStatus'
  | 'supplierQuoteStatus'
  | 'supplierInvoiceStatus'
  | 'paymentStatus'
  | 'shippingInvoiceStatus'
  | 'consolidationStatus';

export interface DocumentStatusFlow<T extends string = string> {
  enumKey: DocumentStatusEnumKey;
  steps: ReadonlyArray<DocumentStatusStep<T>>;
}

export const MATERIAL_REQUEST_STATUS_FLOW = {
  enumKey: 'materialRequestStatus',
  steps: [
    { value: MaterialRequestStatus.DRAFT, color: 'default' },
    { value: MaterialRequestStatus.QUOTING, color: 'warning' },
    { value: MaterialRequestStatus.PARTIALLY_ORDERED, color: 'warning' },
    { value: MaterialRequestStatus.ORDERED, color: 'success' },
    { value: MaterialRequestStatus.CLOSED, color: 'default' },
  ],
} as const satisfies DocumentStatusFlow<(typeof MaterialRequestStatus)[keyof typeof MaterialRequestStatus]>;

export const SUPPLIER_QUOTE_STATUS_FLOW = {
  enumKey: 'supplierQuoteStatus',
  steps: [
    { value: SupplierQuoteStatus.DRAFT, color: 'default' },
    { value: SupplierQuoteStatus.SUBMITTED, color: 'info' },
    { value: SupplierQuoteStatus.PARTIALLY_ACCEPTED, color: 'warning' },
    { value: SupplierQuoteStatus.ACCEPTED, color: 'success' },
    { value: SupplierQuoteStatus.REJECTED, color: 'error' },
  ],
} as const satisfies DocumentStatusFlow<(typeof SupplierQuoteStatus)[keyof typeof SupplierQuoteStatus]>;

export const SUPPLIER_INVOICE_STATUS_FLOW = {
  enumKey: 'supplierInvoiceStatus',
  steps: [
    { value: SupplierInvoiceStatus.DRAFT, color: 'default' },
    { value: SupplierInvoiceStatus.ISSUED, color: 'info' },
    { value: SupplierInvoiceStatus.PARTIALLY_PAID, color: 'warning' },
    { value: SupplierInvoiceStatus.PAID, color: 'success' },
    { value: SupplierInvoiceStatus.CONFIRMED, color: 'success' },
  ],
} as const satisfies DocumentStatusFlow<(typeof SupplierInvoiceStatus)[keyof typeof SupplierInvoiceStatus]>;

export const PAYMENT_STATUS_FLOW = {
  enumKey: 'paymentStatus',
  steps: [
    { value: PaymentStatus.PENDING, color: 'default' },
    { value: PaymentStatus.UPLOADED, color: 'info' },
    { value: PaymentStatus.CONFIRMED, color: 'success' },
    { value: PaymentStatus.REJECTED, color: 'error' },
  ],
} as const satisfies DocumentStatusFlow<(typeof PaymentStatus)[keyof typeof PaymentStatus]>;

export const SHIPPING_INVOICE_STATUS_FLOW = {
  enumKey: 'shippingInvoiceStatus',
  steps: [
    { value: ShippingInvoiceStatus.DRAFT, color: 'default' },
    { value: ShippingInvoiceStatus.ISSUED, color: 'info' },
    { value: ShippingInvoiceStatus.IN_TRANSIT, color: 'warning' },
    { value: ShippingInvoiceStatus.DELIVERED, color: 'success' },
  ],
} as const satisfies DocumentStatusFlow<(typeof ShippingInvoiceStatus)[keyof typeof ShippingInvoiceStatus]>;

export const CONSOLIDATION_STATUS_FLOW = {
  enumKey: 'consolidationStatus',
  steps: [
    { value: ConsolidationStatus.DRAFT, color: 'default' },
    { value: ConsolidationStatus.PLANNED, color: 'info' },
    { value: ConsolidationStatus.IN_TRANSIT, color: 'warning' },
    { value: ConsolidationStatus.CUSTOMS, color: 'secondary' },
    { value: ConsolidationStatus.DELIVERED, color: 'success' },
  ],
} as const satisfies DocumentStatusFlow<(typeof ConsolidationStatus)[keyof typeof ConsolidationStatus]>;

/**
 * Hides terminal branch statuses (e.g. REJECTED) unless the document is in that
 * status. When on a branch, replaces the final happy-path terminal with it.
 */
export function getVisibleDocumentStatusSteps<T extends string>(
  steps: ReadonlyArray<DocumentStatusStep<T>>,
  currentStatus: T,
): DocumentStatusStep<T>[] {
  const branchSteps = steps.filter((step) => step.color === 'error');
  if (branchSteps.length === 0) {
    return [...steps];
  }

  const branchValues = new Set(branchSteps.map((step) => step.value));
  const mainSteps = steps.filter((step) => !branchValues.has(step.value));

  if (branchValues.has(currentStatus)) {
    const currentStep = steps.find((step) => step.value === currentStatus);
    if (!currentStep) {
      return mainSteps;
    }
    return [...mainSteps.slice(0, -1), currentStep];
  }

  return mainSteps;
}
