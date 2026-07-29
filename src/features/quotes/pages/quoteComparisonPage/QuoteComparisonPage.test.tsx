import { describe, expect, it, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import { Route, Routes } from 'react-router-dom';

import { useGetMeQuery } from '@/api/endpoints/authApi';
import { useGetQuoteComparisonQuery } from '@/api/endpoints/requestsApi';
import { QuoteComparisonPage } from '@/features/quotes/pages/quoteComparisonPage/QuoteComparisonPage';
import {
  COMPANY_ID,
  createMembership,
  createQuoteComparison,
  createTestUser,
  REQUEST_ID,
} from '@/test/fixtures';
import { renderWithProviders } from '@/test/render';

vi.mock('@/api/endpoints/authApi', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('@/api/endpoints/authApi')>();
  return {
    ...actual,
    useGetMeQuery: vi.fn(),
  };
});

vi.mock('@/api/endpoints/requestsApi', () => ({
  useGetQuoteComparisonQuery: vi.fn(),
}));

vi.mock('@/features/quotes/hooks/useQuoteLineSelectionMap', () => ({
  useQuoteLineSelectionMap: vi.fn(() => ({
    selectionMap: new Map(),
    isLoading: false,
  })),
}));

const mockedUseGetMeQuery = vi.mocked(useGetMeQuery);
const mockedUseGetQuoteComparisonQuery = vi.mocked(useGetQuoteComparisonQuery);

describe('QuoteComparisonPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockedUseGetQuoteComparisonQuery.mockReturnValue({
      data: createQuoteComparison(),
      isLoading: false,
      isFetching: false,
      refetch: vi.fn(),
    } as ReturnType<typeof useGetQuoteComparisonQuery>);
  });

  it('renders comparison matrix cells for suppliers and lines', () => {
    mockedUseGetMeQuery.mockReturnValue({
      data: {
        user: createTestUser({
          memberships: [
            createMembership({
              effectivePermissions: ['viewRequests'],
            }),
          ],
        }),
      },
      isLoading: false,
      isFetching: false,
      refetch: vi.fn(),
    } as ReturnType<typeof useGetMeQuery>);

    renderWithProviders(
      <Routes>
        <Route
          path="/app/requests/:requestId/compare"
          element={<QuoteComparisonPage />}
        />
      </Routes>,
      {
        preloadedState: { auth: { activeCompanyId: COMPANY_ID } as never },
        route: `/app/requests/${REQUEST_ID}/compare`,
      },
    );

    expect(screen.getByText('Bolt M8')).toBeInTheDocument();
    expect(screen.getByText('Nut M8')).toBeInTheDocument();
    expect(screen.getAllByText('Supplier A').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Supplier B').length).toBeGreaterThan(0);
    expect(screen.getAllByText(/1\.00/).length).toBeGreaterThan(0);
    expect(screen.getByText(/0\.90/)).toBeInTheDocument();
  });

  it('shows back to request link', () => {
    mockedUseGetMeQuery.mockReturnValue({
      data: {
        user: createTestUser({
          memberships: [
            createMembership({
              effectivePermissions: ['viewRequests'],
            }),
          ],
        }),
      },
      isLoading: false,
      isFetching: false,
      refetch: vi.fn(),
    } as ReturnType<typeof useGetMeQuery>);

    renderWithProviders(
      <Routes>
        <Route
          path="/app/requests/:requestId/compare"
          element={<QuoteComparisonPage />}
        />
      </Routes>,
      {
        preloadedState: { auth: { activeCompanyId: COMPANY_ID } as never },
        route: `/app/requests/${REQUEST_ID}/compare`,
      },
    );

    expect(screen.getByText('Back to request')).toBeInTheDocument();
  });
});
