import type { GetCompaniesCompanyIdInvoicesDirection } from '@/api/generated/models/getCompaniesCompanyIdInvoicesDirection';
import type { GetCompaniesCompanyIdInvoicesParams } from '@/api/generated/models/getCompaniesCompanyIdInvoicesParams';
import type { SupplierInvoiceSummaryStatus } from '@/api/generated/models/supplierInvoiceSummaryStatus';
import {
  dateInputToIsoEndOfDay,
  dateInputToIsoStartOfDay,
} from '@/lib/dateInput';

export type InvoicesFiltersValue = {
  status: SupplierInvoiceSummaryStatus | 'ALL';
  /**
   * Single selected company id that maps to:
   * - inbound  -> supplierCompanyId
   * - outbound -> buyerCompanyId
   */
  counterpartyCompanyId: string | null;
  currency: string | null;
  invoiceNumber: string;
  /**
   * Local date input values in format: YYYY-MM-DD
   * (empty string means "not set").
   */
  createdFrom: string;
  createdTo: string;
};

export const DEFAULT_INVOICES_FILTERS: InvoicesFiltersValue = {
  status: 'ALL',
  counterpartyCompanyId: null,
  currency: null,
  invoiceNumber: '',
  createdFrom: '',
  createdTo: '',
};

export const INVOICE_STATUS_OPTIONS: Array<
  SupplierInvoiceSummaryStatus | 'ALL'
> = ['ALL', 'DRAFT', 'ISSUED', 'PARTIALLY_PAID', 'PAID', 'CONFIRMED'];

export function buildInvoicesListQueryArgs({
  companyId,
  direction,
  limit,
  offset,
  filters,
  requestId,
}: {
  companyId: string;
  direction: GetCompaniesCompanyIdInvoicesDirection;
  limit: number;
  offset: number;
  filters: InvoicesFiltersValue;
  requestId?: string;
}): { companyId: string } & GetCompaniesCompanyIdInvoicesParams {
  const trimmedInvoiceNumber = filters.invoiceNumber.trim();

  const params: GetCompaniesCompanyIdInvoicesParams = {
    limit,
    offset,
    direction,
    ...(requestId ? { requestId } : {}),
    ...(filters.status !== 'ALL' ? { status: filters.status } : {}),
    ...(filters.counterpartyCompanyId
      ? direction === 'inbound'
        ? { supplierCompanyId: filters.counterpartyCompanyId }
        : { buyerCompanyId: filters.counterpartyCompanyId }
      : {}),
    ...(filters.currency ? { currency: filters.currency } : {}),
    ...(trimmedInvoiceNumber ? { invoiceNumber: trimmedInvoiceNumber } : {}),
    ...(filters.createdFrom
      ? { createdFrom: dateInputToIsoStartOfDay(filters.createdFrom) }
      : {}),
    ...(filters.createdTo
      ? { createdTo: dateInputToIsoEndOfDay(filters.createdTo) }
      : {}),
  };

  return { companyId, ...params };
}

export function clearCounterpartyOnDirectionChange(
  nextDirection: GetCompaniesCompanyIdInvoicesDirection,
  prev: InvoicesFiltersValue,
): InvoicesFiltersValue {
  void nextDirection;
  return { ...prev, counterpartyCompanyId: null };
}

export function areInvoicesFiltersEqual(
  a: InvoicesFiltersValue,
  b: InvoicesFiltersValue,
): boolean {
  return (
    a.status === b.status &&
    a.counterpartyCompanyId === b.counterpartyCompanyId &&
    a.currency === b.currency &&
    a.invoiceNumber === b.invoiceNumber &&
    a.createdFrom === b.createdFrom &&
    a.createdTo === b.createdTo
  );
}
