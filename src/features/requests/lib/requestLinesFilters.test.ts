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
        createdByUserId: ' user-1 ',
        distributed: 'false',
        quoted: 'false',
        selected: 'true',
        invoiced: 'any',
        shipped: 'false',
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
        createdByUserId: 'user-1',
        distributed: 'false',
        quoted: 'false',
        selected: 'true',
        shipped: 'false',
      }),
    );
    expect(args).not.toHaveProperty('invoiced');
  });

  it('omits default outbound filters from query args', () => {
    const args = buildOutboundRequestLinesQueryArgs({
      companyId: 'company-1',
      limit: 20,
      offset: 0,
      filters: DEFAULT_REQUEST_LINES_FILTERS,
    });

    expect(args).not.toHaveProperty('q');
    expect(args).not.toHaveProperty('createdByUserId');
    expect(args).not.toHaveProperty('distributed');
    expect(args).not.toHaveProperty('quoted');
    expect(args).not.toHaveProperty('selected');
    expect(args).not.toHaveProperty('invoiced');
    expect(args).not.toHaveProperty('shipped');
  });

  it('maps inbound filters to API query args', () => {
    const args = buildInboundRequestLinesQueryArgs({
      companyId: 'company-1',
      limit: 20,
      offset: 40,
      filters: {
        ...DEFAULT_REQUEST_LINES_FILTERS,
        q: 'sku',
        buyerCompanyId: 'buyer-1',
        quoted: 'false',
      },
    });

    expect(args).toEqual(
      expect.objectContaining({
        q: 'sku',
        buyerCompanyId: 'buyer-1',
        quoted: 'false',
        offset: 40,
      }),
    );
    expect(args).not.toHaveProperty('distributed');
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
          distributed: 'false',
        },
        'outbound',
      ),
    ).toBe(3);

    expect(
      countActiveRequestLinesFilters(
        {
          ...DEFAULT_REQUEST_LINES_FILTERS,
          buyerCompanyId: 'buyer-1',
          quoted: 'true',
        },
        'inbound',
      ),
    ).toBe(2);
  });
});
