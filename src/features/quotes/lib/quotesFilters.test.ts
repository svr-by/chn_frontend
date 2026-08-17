import { describe, expect, it } from 'vitest';

import {
  buildQuotesListQueryArgs,
  DEFAULT_QUOTES_FILTERS,
  countActiveQuotesFilters,
} from '@/features/quotes/lib/quotesFilters';

describe('quotesFilters', () => {
  it('maps number filter to API number param', () => {
    const args = buildQuotesListQueryArgs({
      companyId: 'company-1',
      direction: 'inbound',
      limit: 20,
      offset: 0,
      filters: {
        ...DEFAULT_QUOTES_FILTERS,
        number: ' Q-100 ',
      },
    });

    expect(args).toEqual(
      expect.objectContaining({
        number: 'Q-100',
      }),
    );
  });

  it('omits empty number from query args', () => {
    const args = buildQuotesListQueryArgs({
      companyId: 'company-1',
      direction: 'inbound',
      limit: 20,
      offset: 0,
      filters: DEFAULT_QUOTES_FILTERS,
    });

    expect(args).not.toHaveProperty('number');
  });

  it('counts number as an active filter', () => {
    expect(countActiveQuotesFilters(DEFAULT_QUOTES_FILTERS)).toBe(0);
    expect(
      countActiveQuotesFilters({
        ...DEFAULT_QUOTES_FILTERS,
        number: ' Q-1 ',
      }),
    ).toBe(1);
  });
});
