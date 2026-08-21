import { describe, expect, it } from 'vitest';

import {
  DEFAULT_REQUESTS_FILTERS,
  INBOUND_REQUEST_STATUS_OPTIONS,
  OUTBOUND_REQUEST_STATUS_OPTIONS,
  applyPeopleQueueFilter,
  buildInboundRequestsQueryArgs,
  buildOutboundRequestsQueryArgs,
  clearFiltersOnTabChange,
  countActiveRequestsFilters,
  getPeopleQueueFilter,
  requestStatusOptionsForTab,
} from '@/features/requests/lib/requestsFilters';
import {
  dateInputToIsoEndOfDay,
  dateInputToIsoStartOfDay,
} from '@/lib/dateInput';

describe('requestsFilters', () => {
  it('exposes DRAFT only for outbound status options', () => {
    expect(OUTBOUND_REQUEST_STATUS_OPTIONS).toContain('DRAFT');
    expect(INBOUND_REQUEST_STATUS_OPTIONS).not.toContain('DRAFT');
    expect(requestStatusOptionsForTab('inbound')).not.toContain('DRAFT');
  });

  it('builds outbound query args with status', () => {
    expect(
      buildOutboundRequestsQueryArgs({
        companyId: 'company-1',
        limit: 20,
        offset: 0,
        filters: { ...DEFAULT_REQUESTS_FILTERS, status: 'QUOTING' },
      }),
    ).toEqual({
      companyId: 'company-1',
      limit: 20,
      offset: 0,
      status: 'QUOTING',
    });
  });

  it('maps extended outbound filters including people', () => {
    expect(
      buildOutboundRequestsQueryArgs({
        companyId: 'company-1',
        limit: 20,
        offset: 0,
        filters: {
          ...DEFAULT_REQUESTS_FILTERS,
          q: ' bolts ',
          priority: 'HIGH',
          createdFrom: '2026-01-01',
          createdTo: '2026-01-31',
          sortBy: 'updatedAt',
          sortOrder: 'asc',
          createdByUserId: 'author-1',
          assigneeUserId: 'assignee-1',
        },
      }),
    ).toEqual({
      companyId: 'company-1',
      limit: 20,
      offset: 0,
      q: 'bolts',
      priority: 'HIGH',
      createdFrom: dateInputToIsoStartOfDay('2026-01-01'),
      createdTo: dateInputToIsoEndOfDay('2026-01-31'),
      sortBy: 'updatedAt',
      sortOrder: 'asc',
      createdByUserId: 'author-1',
      assigneeUserId: 'assignee-1',
    });
  });

  it('maps simplified people queue to filter fields', () => {
    expect(
      getPeopleQueueFilter(
        { createdByUserId: 'user-1', assigneeUserId: '' },
        'user-1',
      ),
    ).toBe('CREATED_BY_ME');
    expect(
      getPeopleQueueFilter(
        { createdByUserId: '', assigneeUserId: 'user-1' },
        'user-1',
      ),
    ).toBe('ASSIGNED_TO_ME');
    expect(
      applyPeopleQueueFilter(
        DEFAULT_REQUESTS_FILTERS,
        'ASSIGNED_TO_ME',
        'user-1',
      ),
    ).toEqual({
      ...DEFAULT_REQUESTS_FILTERS,
      assigneeUserId: 'user-1',
    });
  });

  it('omits inverted date range from outbound query', () => {
    const args = buildOutboundRequestsQueryArgs({
      companyId: 'company-1',
      limit: 20,
      offset: 0,
      filters: {
        ...DEFAULT_REQUESTS_FILTERS,
        createdFrom: '2026-02-01',
        createdTo: '2026-01-01',
      },
    });

    expect(args).not.toHaveProperty('createdFrom');
    expect(args).not.toHaveProperty('createdTo');
  });

  it('omits status when ALL', () => {
    expect(
      buildInboundRequestsQueryArgs({
        companyId: 'company-1',
        limit: 20,
        offset: 40,
        filters: DEFAULT_REQUESTS_FILTERS,
      }),
    ).toEqual({
      companyId: 'company-1',
      limit: 20,
      offset: 40,
    });
  });

  it('maps extended inbound filters to API query args', () => {
    expect(
      buildInboundRequestsQueryArgs({
        companyId: 'company-1',
        limit: 20,
        offset: 0,
        filters: {
          ...DEFAULT_REQUESTS_FILTERS,
          status: 'QUOTING',
          q: ' bolts ',
          priority: 'URGENT',
          buyerCompanyId: 'buyer-1',
          createdFrom: '2026-01-01',
          createdTo: '2026-01-31',
          sortBy: 'createdAt',
          sortOrder: 'desc',
        },
      }),
    ).toEqual({
      companyId: 'company-1',
      limit: 20,
      offset: 0,
      status: 'QUOTING',
      q: 'bolts',
      priority: 'URGENT',
      buyerCompanyId: 'buyer-1',
      distributedFrom: dateInputToIsoStartOfDay('2026-01-01'),
      distributedTo: dateInputToIsoEndOfDay('2026-01-31'),
      sortBy: 'createdAt',
      sortOrder: 'desc',
    });
  });

  it('omits inverted date range from inbound query', () => {
    const args = buildInboundRequestsQueryArgs({
      companyId: 'company-1',
      limit: 20,
      offset: 0,
      filters: {
        ...DEFAULT_REQUESTS_FILTERS,
        createdFrom: '2026-02-01',
        createdTo: '2026-01-01',
      },
    });

    expect(args).not.toHaveProperty('distributedFrom');
    expect(args).not.toHaveProperty('distributedTo');
  });

  it('clears DRAFT when switching to inbound', () => {
    expect(
      clearFiltersOnTabChange('inbound', {
        ...DEFAULT_REQUESTS_FILTERS,
        status: 'DRAFT',
      }),
    ).toEqual({ ...DEFAULT_REQUESTS_FILTERS, status: 'ALL' });
    expect(
      clearFiltersOnTabChange('inbound', {
        ...DEFAULT_REQUESTS_FILTERS,
        status: 'QUOTING',
      }),
    ).toEqual({ ...DEFAULT_REQUESTS_FILTERS, status: 'QUOTING' });
  });

  it('clears tab-specific filters when switching', () => {
    expect(
      clearFiltersOnTabChange('inbound', {
        ...DEFAULT_REQUESTS_FILTERS,
        createdByUserId: 'user-1',
        assigneeUserId: 'user-2',
      }),
    ).toEqual(DEFAULT_REQUESTS_FILTERS);
    expect(
      clearFiltersOnTabChange('outbound', {
        ...DEFAULT_REQUESTS_FILTERS,
        buyerCompanyId: 'buyer-1',
      }),
    ).toEqual(DEFAULT_REQUESTS_FILTERS);
  });

  it('counts active filters by tab', () => {
    expect(countActiveRequestsFilters(DEFAULT_REQUESTS_FILTERS, 'outbound')).toBe(
      0,
    );
    expect(
      countActiveRequestsFilters(
        {
          ...DEFAULT_REQUESTS_FILTERS,
          status: 'QUOTING',
          q: 'bolts',
          priority: 'HIGH',
          createdByUserId: 'user-1',
        },
        'outbound',
      ),
    ).toBe(4);
    expect(
      countActiveRequestsFilters(
        {
          ...DEFAULT_REQUESTS_FILTERS,
          status: 'QUOTING',
          q: 'bolts',
          priority: 'HIGH',
          buyerCompanyId: 'buyer-1',
          createdByUserId: 'user-1',
        },
        'inbound',
      ),
    ).toBe(4);
  });
});
