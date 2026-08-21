import type { GetCompaniesCompanyIdRequestsInboundParams } from '@/api/generated/models/getCompaniesCompanyIdRequestsInboundParams';
import type { GetCompaniesCompanyIdRequestsInboundPriority } from '@/api/generated/models/getCompaniesCompanyIdRequestsInboundPriority';
import type { GetCompaniesCompanyIdRequestsInboundSortBy } from '@/api/generated/models/getCompaniesCompanyIdRequestsInboundSortBy';
import type { GetCompaniesCompanyIdRequestsInboundSortOrder } from '@/api/generated/models/getCompaniesCompanyIdRequestsInboundSortOrder';
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

/** Simplified outbound people filter when the user cannot list members. */
export type RequestsPeopleQueueFilter =
  | 'ALL'
  | 'CREATED_BY_ME'
  | 'ASSIGNED_TO_ME';

export type RequestsFiltersValue = {
  status: MaterialRequestStatus | 'ALL';
  q: string;
  priority: GetCompaniesCompanyIdRequestsPriority | 'ALL';
  buyerCompanyId: string;
  createdFrom: string;
  createdTo: string;
  sortBy: GetCompaniesCompanyIdRequestsSortBy | '';
  sortOrder: GetCompaniesCompanyIdRequestsSortOrder | '';
  createdByUserId: string;
  assigneeUserId: string;
};

export const DEFAULT_REQUESTS_FILTERS: RequestsFiltersValue = {
  status: 'ALL',
  q: '',
  priority: 'ALL',
  buyerCompanyId: '',
  createdFrom: '',
  createdTo: '',
  sortBy: '',
  sortOrder: '',
  createdByUserId: '',
  assigneeUserId: '',
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

function resolveDateRange(from: string, to: string): {
  fromIso?: string;
  toIso?: string;
} {
  const fromIso =
    from && (!to || from <= to) ? dateInputToIsoStartOfDay(from) : undefined;
  const toIso =
    to && (!from || from <= to) ? dateInputToIsoEndOfDay(to) : undefined;
  return { fromIso, toIso };
}

export function getPeopleQueueFilter(
  filters: Pick<RequestsFiltersValue, 'createdByUserId' | 'assigneeUserId'>,
  currentUserId?: string | null,
): RequestsPeopleQueueFilter {
  if (!currentUserId) {
    return 'ALL';
  }

  const createdBy = filters.createdByUserId.trim();
  const assignee = filters.assigneeUserId.trim();

  if (createdBy === currentUserId && assignee === '') {
    return 'CREATED_BY_ME';
  }
  if (assignee === currentUserId && createdBy === '') {
    return 'ASSIGNED_TO_ME';
  }
  return 'ALL';
}

export function applyPeopleQueueFilter(
  filters: RequestsFiltersValue,
  queue: RequestsPeopleQueueFilter,
  currentUserId?: string | null,
): RequestsFiltersValue {
  if (!currentUserId || queue === 'ALL') {
    return { ...filters, createdByUserId: '', assigneeUserId: '' };
  }
  if (queue === 'CREATED_BY_ME') {
    return {
      ...filters,
      createdByUserId: currentUserId,
      assigneeUserId: '',
    };
  }
  return {
    ...filters,
    createdByUserId: '',
    assigneeUserId: currentUserId,
  };
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
  const trimmedQ = filters.q.trim();
  const createdByUserId = filters.createdByUserId.trim();
  const assigneeUserId = filters.assigneeUserId.trim();
  const { fromIso: createdFrom, toIso: createdTo } = resolveDateRange(
    filters.createdFrom,
    filters.createdTo,
  );

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
    ...(createdByUserId ? { createdByUserId } : {}),
    ...(assigneeUserId ? { assigneeUserId } : {}),
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
  const trimmedQ = filters.q.trim();
  const buyerCompanyId = filters.buyerCompanyId.trim();
  const { fromIso: distributedFrom, toIso: distributedTo } = resolveDateRange(
    filters.createdFrom,
    filters.createdTo,
  );

  return {
    companyId,
    limit,
    offset,
    ...(filters.status !== 'ALL' ? { status: filters.status } : {}),
    ...(trimmedQ ? { q: trimmedQ } : {}),
    ...(filters.priority !== 'ALL'
      ? {
          priority:
            filters.priority as GetCompaniesCompanyIdRequestsInboundPriority,
        }
      : {}),
    ...(buyerCompanyId ? { buyerCompanyId } : {}),
    ...(distributedFrom ? { distributedFrom } : {}),
    ...(distributedTo ? { distributedTo } : {}),
    ...(filters.sortBy
      ? {
          sortBy: filters.sortBy as GetCompaniesCompanyIdRequestsInboundSortBy,
        }
      : {}),
    ...(filters.sortOrder
      ? {
          sortOrder:
            filters.sortOrder as GetCompaniesCompanyIdRequestsInboundSortOrder,
        }
      : {}),
  };
}

/** Clear invalid inbound status (e.g. DRAFT) when switching tabs. */
export function clearFiltersOnTabChange(
  nextTab: RequestsTab,
  prev: RequestsFiltersValue,
): RequestsFiltersValue {
  let next = prev;

  if (nextTab === 'inbound' && prev.status === 'DRAFT') {
    next = { ...next, status: 'ALL' };
  }

  if (
    nextTab === 'inbound' &&
    (prev.createdByUserId !== '' || prev.assigneeUserId !== '')
  ) {
    next = { ...next, createdByUserId: '', assigneeUserId: '' };
  }

  if (nextTab === 'outbound' && prev.buyerCompanyId !== '') {
    next = { ...next, buyerCompanyId: '' };
  }

  return next;
}

export function areRequestsFiltersEqual(
  a: RequestsFiltersValue,
  b: RequestsFiltersValue,
): boolean {
  return (
    a.status === b.status &&
    a.q === b.q &&
    a.priority === b.priority &&
    a.buyerCompanyId === b.buyerCompanyId &&
    a.createdFrom === b.createdFrom &&
    a.createdTo === b.createdTo &&
    a.sortBy === b.sortBy &&
    a.sortOrder === b.sortOrder &&
    a.createdByUserId === b.createdByUserId &&
    a.assigneeUserId === b.assigneeUserId
  );
}

export function countActiveRequestsFilters(
  filters: RequestsFiltersValue,
  tab: RequestsTab,
): number {
  let count = 0;
  if (filters.status !== DEFAULT_REQUESTS_FILTERS.status) count += 1;
  if (filters.q.trim() !== '') count += 1;
  if (filters.priority !== 'ALL') count += 1;
  if (filters.createdFrom !== '') count += 1;
  if (filters.createdTo !== '') count += 1;
  if (filters.sortBy !== '') count += 1;
  if (filters.sortOrder !== '') count += 1;

  if (tab === 'outbound') {
    if (filters.createdByUserId.trim() !== '') count += 1;
    if (filters.assigneeUserId.trim() !== '') count += 1;
  } else if (filters.buyerCompanyId.trim() !== '') {
    count += 1;
  }

  return count;
}
