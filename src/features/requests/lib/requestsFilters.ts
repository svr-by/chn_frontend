import type { GetCompaniesCompanyIdRequestsInboundParams } from '@/api/generated/models/getCompaniesCompanyIdRequestsInboundParams';
import type { GetCompaniesCompanyIdRequestsParams } from '@/api/generated/models/getCompaniesCompanyIdRequestsParams';
import type { MaterialRequestStatus } from '@/types/api';

export type RequestsTab = 'outbound' | 'inbound';

export type RequestsFiltersValue = {
  status: MaterialRequestStatus | 'ALL';
};

export const DEFAULT_REQUESTS_FILTERS: RequestsFiltersValue = {
  status: 'ALL',
};

export const OUTBOUND_REQUEST_STATUS_OPTIONS: Array<
  MaterialRequestStatus | 'ALL'
> = ['ALL', 'DRAFT', 'QUOTING', 'PARTIALLY_ORDERED', 'ORDERED', 'CLOSED'];

export const INBOUND_REQUEST_STATUS_OPTIONS: Array<
  MaterialRequestStatus | 'ALL'
> = ['ALL', 'QUOTING', 'PARTIALLY_ORDERED', 'ORDERED', 'CLOSED'];

export function requestStatusOptionsForTab(
  tab: RequestsTab,
): Array<MaterialRequestStatus | 'ALL'> {
  return tab === 'inbound'
    ? INBOUND_REQUEST_STATUS_OPTIONS
    : OUTBOUND_REQUEST_STATUS_OPTIONS;
}

export function buildOutboundRequestsQueryArgs({
  companyId,
  limit,
  offset,
  filters,
}: {
  companyId: string;
  limit: number;
  offset: number;
  filters: RequestsFiltersValue;
}): { companyId: string } & GetCompaniesCompanyIdRequestsParams {
  return {
    companyId,
    limit,
    offset,
    ...(filters.status !== 'ALL' ? { status: filters.status } : {}),
  };
}

export function buildInboundRequestsQueryArgs({
  companyId,
  limit,
  offset,
  filters,
}: {
  companyId: string;
  limit: number;
  offset: number;
  filters: RequestsFiltersValue;
}): { companyId: string } & GetCompaniesCompanyIdRequestsInboundParams {
  return {
    companyId,
    limit,
    offset,
    ...(filters.status !== 'ALL' ? { status: filters.status } : {}),
  };
}

/** Clear invalid inbound status (e.g. DRAFT) when switching tabs. */
export function clearFiltersOnTabChange(
  nextTab: RequestsTab,
  prev: RequestsFiltersValue,
): RequestsFiltersValue {
  if (
    nextTab === 'inbound' &&
    prev.status === 'DRAFT'
  ) {
    return { ...prev, status: 'ALL' };
  }
  return prev;
}

export function areRequestsFiltersEqual(
  a: RequestsFiltersValue,
  b: RequestsFiltersValue,
): boolean {
  return a.status === b.status;
}
