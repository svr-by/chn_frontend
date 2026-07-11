import { describe, expect, it, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';

import { useGetMeQuery } from '@/api/endpoints/authApi';
import { useListQuotesQuery } from '@/api/endpoints/quotesApi';
import { QuotesPage } from '@/features/quotes/pages/QuotesPage';
import {
  COMPANY_ID,
  createMembership,
  createSupplierQuoteSummary,
  createTestUser,
} from '@/test/fixtures';
import { renderWithProviders } from '@/test/render';

vi.mock('@/api/endpoints/authApi', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/api/endpoints/authApi')>();
  return {
    ...actual,
    useGetMeQuery: vi.fn(),
  };
});

vi.mock('@/api/endpoints/quotesApi', () => ({
  useListQuotesQuery: vi.fn(),
  useGetQuoteQuery: vi.fn(),
  useCreateQuoteMutation: vi.fn(),
  useUpdateQuoteMutation: vi.fn(),
  useAddQuoteLineMutation: vi.fn(),
  useUpdateQuoteLineMutation: vi.fn(),
  useDeleteQuoteLineMutation: vi.fn(),
  useSubmitQuoteMutation: vi.fn(),
}));

const mockedUseGetMeQuery = vi.mocked(useGetMeQuery);
const mockedUseListQuotesQuery = vi.mocked(useListQuotesQuery);

describe('QuotesPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockedUseListQuotesQuery.mockReturnValue({
      data: {
        quotes: [createSupplierQuoteSummary()],
        pagination: { total: 1, limit: 20, offset: 0 },
      },
      isLoading: false,
      isFetching: false,
      refetch: vi.fn(),
    } as ReturnType<typeof useListQuotesQuery>);
  });

  it('renders quote list', () => {
    mockedUseGetMeQuery.mockReturnValue({
      data: {
        user: createTestUser({
          memberships: [
            createMembership({
              effectivePermissions: ['viewQuotes'],
            }),
          ],
        }),
      },
      isLoading: false,
      isFetching: false,
      refetch: vi.fn(),
    } as ReturnType<typeof useGetMeQuery>);

    renderWithProviders(<QuotesPage />, {
      preloadedState: { auth: { activeCompanyId: COMPANY_ID } as never },
      route: '/app/quotes',
    });

    expect(screen.getByText('Buyer Corp')).toBeInTheDocument();
    expect(screen.getByText('Draft')).toBeInTheDocument();
  });
});
