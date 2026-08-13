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
  /** Document number filter (API query param `number`). */
  number: string;
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
  number: '',
  createdFrom: '',
  createdTo: '',
};

export const INVOICE_STATUS_OPTIONS: Array<
  SupplierInvoiceSummaryStatus | 'ALL'
> = ['ALL', 'DRAFT', 'ISSUED', 'PARTIALLY_PAID', 'PAID', 'CONFIRMED'];

export function getInvoiceStatusOptions(
  direction: GetCompaniesCompanyIdInvoicesDirection,
): Array<SupplierInvoiceSummaryStatus | 'ALL'> {
  if (direction === 'inbound') {
    return INVOICE_STATUS_OPTIONS.filter((status) => status !== 'DRAFT');
  }
  return INVOICE_STATUS_OPTIONS;
}

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
  const trimmedNumber = filters.number.trim();

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
    ...(trimmedNumber ? { number: trimmedNumber } : {}),
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
  const next: InvoicesFiltersValue = {
    ...prev,
    counterpartyCompanyId: null,
  };
  if (nextDirection === 'inbound' && next.status === 'DRAFT') {
    next.status = 'ALL';
  }
  return next;
}

export function areInvoicesFiltersEqual(
  a: InvoicesFiltersValue,
  b: InvoicesFiltersValue,
): boolean {
  return (
    a.status === b.status &&
    a.counterpartyCompanyId === b.counterpartyCompanyId &&
    a.currency === b.currency &&
    a.number === b.number &&
    a.createdFrom === b.createdFrom &&
    a.createdTo === b.createdTo
  );
}

export function countActiveInvoicesFilters(
  filters: InvoicesFiltersValue,
): number {
  let count = 0;
  if (filters.status !== DEFAULT_INVOICES_FILTERS.status) count += 1;
  if (filters.counterpartyCompanyId != null) count += 1;
  if (filters.currency != null) count += 1;
  if (filters.number.trim() !== '') count += 1;
  if (filters.createdFrom !== '') count += 1;
  if (filters.createdTo !== '') count += 1;
  return count;
}

export function requestIdsFromInvoiceLines(
  lines: Array<{ requestLine?: { requestId?: string } | null }>,
): string[] {
  return [
    ...new Set(
      lines
        .map((line) => line.requestLine?.requestId)
        .filter((id): id is string => Boolean(id)),
    ),
  ];
}
