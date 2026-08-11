import type { GetCompaniesCompanyIdRequestsInboundParams } from '@/api/generated/models/getCompaniesCompanyIdRequestsInboundParams';
import type { GetCompaniesCompanyIdRequestsParams } from '@/api/generated/models/getCompaniesCompanyIdRequestsParams';
import type { GetCompaniesCompanyIdRequestsPriority } from '@/api/generated/models/getCompaniesCompanyIdRequestsPriority';
import type { GetCompaniesCompanyIdRequestsSortBy } from '@/api/generated/models/getCompaniesCompanyIdRequestsSortBy';
import type { GetCompaniesCompanyIdRequestsSortOrder } from '@/api/generated/models/getCompaniesCompanyIdRequestsSortOrder';
import type { MaterialRequestStatus } from '@/types/api';
import {
  dateInputToIsoEndOfDay,
  dateInputToIsoStartOfDay,
} from '@/lib/dateInput';

export type RequestsTab = 'outbound' | 'inbound';

export type RequestsQueueFilter = 'ALL' | 'CREATED_BY_ME' | 'ASSIGNED_TO_ME';

export type RequestsFiltersValue = {
  status: MaterialRequestStatus | 'ALL';
  q: string;
  priority: GetCompaniesCompanyIdRequestsPriority | 'ALL';
  createdFrom: string;
  createdTo: string;
  sortBy: GetCompaniesCompanyIdRequestsSortBy | '';
  sortOrder: GetCompaniesCompanyIdRequestsSortOrder | '';
  queue: RequestsQueueFilter;
};

export const DEFAULT_REQUESTS_FILTERS: RequestsFiltersValue = {
  status: 'ALL',
  q: '',
  priority: 'ALL',
  createdFrom: '',
  createdTo: '',
  sortBy: '',
  sortOrder: '',
  queue: 'ALL',
};

export const OUTBOUND_REQUEST_STATUS_OPTIONS: Array<
  MaterialRequestStatus | 'ALL'
> = ['ALL', 'DRAFT', 'QUOTING', 'PARTIALLY_ORDERED', 'ORDERED', 'CLOSED'];

export const INBOUND_REQUEST_STATUS_OPTIONS: Array<
  MaterialRequestStatus | 'ALL'
> = ['ALL', 'QUOTING', 'PARTIALLY_ORDERED', 'ORDERED', 'CLOSED'];

export const REQUEST_PRIORITY_OPTIONS: Array<
  GetCompaniesCompanyIdRequestsPriority | 'ALL'
> = ['ALL', 'LOW', 'NORMAL', 'HIGH', 'URGENT'];

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
  currentUserId,
}: {
  companyId: string;
  limit: number;
  offset: number;
  filters: RequestsFiltersValue;
  currentUserId?: string | null;
}): { companyId: string } & GetCompaniesCompanyIdRequestsParams {
  const trimmedQ = filters.q.trim();
  const createdFrom =
    filters.createdFrom &&
    (!filters.createdTo || filters.createdFrom <= filters.createdTo)
      ? dateInputToIsoStartOfDay(filters.createdFrom)
      : undefined;
  const createdTo =
    filters.createdTo &&
    (!filters.createdFrom || filters.createdFrom <= filters.createdTo)
      ? dateInputToIsoEndOfDay(filters.createdTo)
      : undefined;

  return {
    companyId,
    limit,
    offset,
    ...(filters.status !== 'ALL' ? { status: filters.status } : {}),
    ...(trimmedQ ? { q: trimmedQ } : {}),
    ...(filters.priority !== 'ALL' ? { priority: filters.priority } : {}),
    ...(createdFrom ? { createdFrom } : {}),
    ...(createdTo ? { createdTo } : {}),
    ...(filters.sortBy ? { sortBy: filters.sortBy } : {}),
    ...(filters.sortOrder ? { sortOrder: filters.sortOrder } : {}),
    ...(filters.queue === 'CREATED_BY_ME' && currentUserId
      ? { createdByUserId: currentUserId }
      : {}),
    ...(filters.queue === 'ASSIGNED_TO_ME' && currentUserId
      ? { assigneeUserId: currentUserId }
      : {}),
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
  if (nextTab === 'inbound' && prev.status === 'DRAFT') {
    return { ...prev, status: 'ALL' };
  }
  return prev;
}

export function areRequestsFiltersEqual(
  a: RequestsFiltersValue,
  b: RequestsFiltersValue,
): boolean {
  return (
    a.status === b.status &&
    a.q === b.q &&
    a.priority === b.priority &&
    a.createdFrom === b.createdFrom &&
    a.createdTo === b.createdTo &&
    a.sortBy === b.sortBy &&
    a.sortOrder === b.sortOrder &&
    a.queue === b.queue
  );
}

export function countActiveRequestsFilters(
  filters: RequestsFiltersValue,
  tab: RequestsTab,
): number {
  let count = 0;
  if (filters.status !== DEFAULT_REQUESTS_FILTERS.status) count += 1;
  if (tab === 'outbound') {
    if (filters.q.trim() !== '') count += 1;
    if (filters.priority !== 'ALL') count += 1;
    if (filters.createdFrom !== '') count += 1;
    if (filters.createdTo !== '') count += 1;
    if (filters.sortBy !== '') count += 1;
    if (filters.sortOrder !== '') count += 1;
    if (filters.queue !== 'ALL') count += 1;
  }
  return count;
}
