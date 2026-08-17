import type { GetCompaniesCompanyIdRequestLinesInboundParams } from '@/api/generated/models/getCompaniesCompanyIdRequestLinesInboundParams';
import { GetCompaniesCompanyIdRequestLinesInboundStatus } from '@/api/generated/models/getCompaniesCompanyIdRequestLinesInboundStatus';
import type { GetCompaniesCompanyIdRequestLinesParams } from '@/api/generated/models/getCompaniesCompanyIdRequestLinesParams';
import { GetCompaniesCompanyIdRequestLinesStatus } from '@/api/generated/models/getCompaniesCompanyIdRequestLinesStatus';
import type { MaterialRequestStatus } from '@/types/api';

export type RequestLinesTab = 'outbound' | 'inbound';

export type RequestLinesFiltersValue = {
  q: string;
  status: MaterialRequestStatus | 'ALL';
  createdByUserId: string;
  undistributed: boolean;
  withoutQuotes: boolean;
};

export const DEFAULT_REQUEST_LINES_FILTERS: RequestLinesFiltersValue = {
  q: '',
  status: 'ALL',
  createdByUserId: '',
  undistributed: false,
  withoutQuotes: false,
};

export const OUTBOUND_REQUEST_LINE_STATUS_OPTIONS: Array<
  MaterialRequestStatus | 'ALL'
> = ['ALL', ...Object.values(GetCompaniesCompanyIdRequestLinesStatus)];

export const INBOUND_REQUEST_LINE_STATUS_OPTIONS: Array<
  MaterialRequestStatus | 'ALL'
> = ['ALL', ...Object.values(GetCompaniesCompanyIdRequestLinesInboundStatus)];

export function requestLineStatusOptionsForTab(
  tab: RequestLinesTab,
): Array<MaterialRequestStatus | 'ALL'> {
  return tab === 'inbound'
    ? INBOUND_REQUEST_LINE_STATUS_OPTIONS
    : OUTBOUND_REQUEST_LINE_STATUS_OPTIONS;
}

export function buildOutboundRequestLinesQueryArgs({
  companyId,
  limit,
  offset,
  filters,
}: {
  companyId: string;
  limit: number;
  offset: number;
  filters: RequestLinesFiltersValue;
}): { companyId: string } & GetCompaniesCompanyIdRequestLinesParams {
  const trimmedQ = filters.q.trim();
  const createdByUserId = filters.createdByUserId.trim();

  return {
    companyId,
    limit,
    offset,
    sortBy: 'requestCreatedAt',
    sortOrder: 'desc',
    ...(trimmedQ ? { q: trimmedQ } : {}),
    ...(filters.status !== 'ALL' ? { status: filters.status } : {}),
    ...(createdByUserId ? { createdByUserId } : {}),
    ...(filters.undistributed ? { undistributed: 'true' } : {}),
    ...(filters.withoutQuotes ? { withoutQuotes: 'true' } : {}),
  };
}

export function buildInboundRequestLinesQueryArgs({
  companyId,
  limit,
  offset,
  filters,
}: {
  companyId: string;
  limit: number;
  offset: number;
  filters: RequestLinesFiltersValue;
}): { companyId: string } & GetCompaniesCompanyIdRequestLinesInboundParams {
  const trimmedQ = filters.q.trim();

  return {
    companyId,
    limit,
    offset,
    sortBy: 'requestCreatedAt',
    sortOrder: 'desc',
    ...(trimmedQ ? { q: trimmedQ } : {}),
    ...(filters.status !== 'ALL' ? { status: filters.status } : {}),
    ...(filters.withoutQuotes ? { withoutQuotes: 'true' } : {}),
  };
}

export function clearFiltersOnTabChange(
  _nextTab: RequestLinesTab,
  prev: RequestLinesFiltersValue,
): RequestLinesFiltersValue {
  return {
    ...prev,
    createdByUserId: '',
    undistributed: false,
  };
}

export function areRequestLinesFiltersEqual(
  a: RequestLinesFiltersValue,
  b: RequestLinesFiltersValue,
): boolean {
  return (
    a.q === b.q &&
    a.status === b.status &&
    a.createdByUserId === b.createdByUserId &&
    a.undistributed === b.undistributed &&
    a.withoutQuotes === b.withoutQuotes
  );
}

export function countActiveRequestLinesFilters(
  filters: RequestLinesFiltersValue,
  tab: RequestLinesTab,
): number {
  let count = 0;
  if (filters.q.trim() !== '') count += 1;
  if (filters.status !== 'ALL') count += 1;
  if (filters.withoutQuotes) count += 1;
  if (tab === 'outbound') {
    if (filters.createdByUserId.trim() !== '') count += 1;
    if (filters.undistributed) count += 1;
  }
  return count;
}
