import { describe, expect, it } from 'vitest';

import {
  DEFAULT_REQUESTS_FILTERS,
  INBOUND_REQUEST_STATUS_OPTIONS,
  OUTBOUND_REQUEST_STATUS_OPTIONS,
  buildInboundRequestsQueryArgs,
  buildOutboundRequestsQueryArgs,
  clearFiltersOnTabChange,
  requestStatusOptionsForTab,
} from '@/features/requests/lib/requestsFilters';

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
        filters: { status: 'QUOTING' },
      }),
    ).toEqual({
      companyId: 'company-1',
      limit: 20,
      offset: 0,
      status: 'QUOTING',
    });
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
      clearFiltersOnTabChange('inbound', { status: 'DRAFT' }),
    ).toEqual({ status: 'ALL' });
    expect(
      clearFiltersOnTabChange('inbound', { status: 'QUOTING' }),
    ).toEqual({ status: 'QUOTING' });
  });
});
