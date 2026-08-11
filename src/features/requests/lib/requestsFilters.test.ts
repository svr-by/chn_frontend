import { describe, expect, it } from 'vitest';

import {
  DEFAULT_REQUESTS_FILTERS,
  INBOUND_REQUEST_STATUS_OPTIONS,
  OUTBOUND_REQUEST_STATUS_OPTIONS,
  buildInboundRequestsQueryArgs,
  buildOutboundRequestsQueryArgs,
  clearFiltersOnTabChange,
  countActiveRequestsFilters,
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

  it('maps extended outbound filters and queues', () => {
    expect(
      buildOutboundRequestsQueryArgs({
        companyId: 'company-1',
        limit: 20,
        offset: 0,
        currentUserId: 'user-1',
        filters: {
          ...DEFAULT_REQUESTS_FILTERS,
          q: ' bolts ',
          priority: 'HIGH',
          createdFrom: '2026-01-01',
          createdTo: '2026-01-31',
          sortBy: 'updatedAt',
          sortOrder: 'asc',
          queue: 'ASSIGNED_TO_ME',
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
        },
        'outbound',
      ),
    ).toBe(3);
    expect(
      countActiveRequestsFilters(
        {
          ...DEFAULT_REQUESTS_FILTERS,
          status: 'QUOTING',
          q: 'bolts',
          priority: 'HIGH',
        },
        'inbound',
      ),
    ).toBe(1);
  });
});
