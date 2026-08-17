import { describe, expect, it } from 'vitest';

import {
  buildInboundRequestLinesQueryArgs,
  buildOutboundRequestLinesQueryArgs,
  countActiveRequestLinesFilters,
  DEFAULT_REQUEST_LINES_FILTERS,
} from '@/features/requests/lib/requestLinesFilters';

describe('requestLinesFilters', () => {
  it('maps outbound filters to API query args', () => {
    const args = buildOutboundRequestLinesQueryArgs({
      companyId: 'company-1',
      limit: 20,
      offset: 0,
      filters: {
        ...DEFAULT_REQUEST_LINES_FILTERS,
        q: ' paper ',
        status: 'QUOTING',
        createdByUserId: ' user-1 ',
        undistributed: true,
        withoutQuotes: true,
      },
    });

    expect(args).toEqual(
      expect.objectContaining({
        companyId: 'company-1',
        limit: 20,
        offset: 0,
        sortBy: 'requestCreatedAt',
        sortOrder: 'desc',
        q: 'paper',
        status: 'QUOTING',
        createdByUserId: 'user-1',
        undistributed: 'true',
        withoutQuotes: 'true',
      }),
    );
  });

  it('omits default outbound filters from query args', () => {
    const args = buildOutboundRequestLinesQueryArgs({
      companyId: 'company-1',
      limit: 20,
      offset: 0,
      filters: DEFAULT_REQUEST_LINES_FILTERS,
    });

    expect(args).not.toHaveProperty('q');
    expect(args).not.toHaveProperty('status');
    expect(args).not.toHaveProperty('createdByUserId');
    expect(args).not.toHaveProperty('undistributed');
    expect(args).not.toHaveProperty('withoutQuotes');
  });

  it('maps inbound filters to API query args', () => {
    const args = buildInboundRequestLinesQueryArgs({
      companyId: 'company-1',
      limit: 20,
      offset: 40,
      filters: {
        ...DEFAULT_REQUEST_LINES_FILTERS,
        q: 'sku',
        status: 'ORDERED',
        withoutQuotes: true,
      },
    });

    expect(args).toEqual(
      expect.objectContaining({
        q: 'sku',
        status: 'ORDERED',
        withoutQuotes: 'true',
        offset: 40,
      }),
    );
  });

  it('counts active filters per tab', () => {
    expect(
      countActiveRequestLinesFilters(DEFAULT_REQUEST_LINES_FILTERS, 'outbound'),
    ).toBe(0);

    expect(
      countActiveRequestLinesFilters(
        {
          ...DEFAULT_REQUEST_LINES_FILTERS,
          q: 'test',
          createdByUserId: 'user-1',
          undistributed: true,
        },
        'outbound',
      ),
    ).toBe(3);

    expect(
      countActiveRequestLinesFilters(
        {
          ...DEFAULT_REQUEST_LINES_FILTERS,
          createdByUserId: 'user-1',
          undistributed: true,
        },
        'inbound',
      ),
    ).toBe(0);
  });
});
