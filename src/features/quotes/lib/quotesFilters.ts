import type { GetCompaniesCompanyIdQuotesDirection } from '@/api/generated/models/getCompaniesCompanyIdQuotesDirection';
import type { GetCompaniesCompanyIdQuotesParams } from '@/api/generated/models/getCompaniesCompanyIdQuotesParams';
import type { SupplierQuoteStatus } from '@/api/generated/models/supplierQuoteStatus';
import {
  dateInputToIsoEndOfDay,
  dateInputToIsoStartOfDay,
} from '@/lib/dateInput';

export type QuotesFiltersValue = {
  status: SupplierQuoteStatus | 'ALL';
  /**
   * Single selected company id that maps to:
   * - inbound  -> supplierCompanyId
   * - outbound -> buyerCompanyId
   */
  counterpartyCompanyId: string | null;
  currency: string | null;
  /**
   * Local date input values in format: YYYY-MM-DD
   * (empty string means "not set").
   */
  createdFrom: string;
  createdTo: string;
};

export const DEFAULT_QUOTES_FILTERS: QuotesFiltersValue = {
  status: 'ALL',
  counterpartyCompanyId: null,
  currency: null,
  createdFrom: '',
  createdTo: '',
};

export const QUOTE_STATUS_OPTIONS: Array<SupplierQuoteStatus | 'ALL'> = [
  'ALL',
  'DRAFT',
  'SUBMITTED',
  'PARTIALLY_ACCEPTED',
  'ACCEPTED',
  'REJECTED',
];

export function buildQuotesListQueryArgs({
  companyId,
  direction,
  limit,
  offset,
  filters,
}: {
  companyId: string;
  direction: GetCompaniesCompanyIdQuotesDirection;
  limit: number;
  offset: number;
  filters: QuotesFiltersValue;
}): { companyId: string } & GetCompaniesCompanyIdQuotesParams {
  const params: GetCompaniesCompanyIdQuotesParams = {
    limit,
    offset,
    direction,
    ...(filters.status !== 'ALL' ? { status: filters.status } : {}),
    ...(filters.counterpartyCompanyId
      ? direction === 'inbound'
        ? { supplierCompanyId: filters.counterpartyCompanyId }
        : { buyerCompanyId: filters.counterpartyCompanyId }
      : {}),
    ...(filters.currency ? { currency: filters.currency } : {}),
    ...(filters.createdFrom ? { createdFrom: dateInputToIsoStartOfDay(filters.createdFrom) } : {}),
    ...(filters.createdTo ? { createdTo: dateInputToIsoEndOfDay(filters.createdTo) } : {}),
  };

  return { companyId, ...params };
}

export function clearCounterpartyOnDirectionChange(
  nextDirection: GetCompaniesCompanyIdQuotesDirection,
  prev: QuotesFiltersValue,
): QuotesFiltersValue {
  // We store a single id mapped to supplier/buyer depending on direction.
  // So on direction change we always clear to avoid "wrong meaning" UX.
  void nextDirection;
  return { ...prev, counterpartyCompanyId: null };
}

export function areQuotesFiltersEqual(
  a: QuotesFiltersValue,
  b: QuotesFiltersValue,
): boolean {
  return (
    a.status === b.status &&
    a.counterpartyCompanyId === b.counterpartyCompanyId &&
    a.currency === b.currency &&
    a.createdFrom === b.createdFrom &&
    a.createdTo === b.createdTo
  );
}

export function countActiveQuotesFilters(filters: QuotesFiltersValue): number {
  let count = 0;
  if (filters.status !== DEFAULT_QUOTES_FILTERS.status) count += 1;
  if (filters.counterpartyCompanyId != null) count += 1;
  if (filters.currency != null) count += 1;
  if (filters.createdFrom !== '') count += 1;
  if (filters.createdTo !== '') count += 1;
  return count;
}

