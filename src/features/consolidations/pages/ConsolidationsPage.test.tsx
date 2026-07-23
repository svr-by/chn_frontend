import { describe, expect, it, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import { Route, Routes } from 'react-router-dom';

import { useGetMeQuery } from '@/api/endpoints/authApi';
import { useListConsolidationsQuery } from '@/api/endpoints/consolidationsApi';
import { ConsolidationsPage } from '@/features/consolidations/pages/ConsolidationsPage';
import {
  COMPANY_ID,
  createConsolidationSummary,
  createMembership,
  createTestUser,
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

vi.mock('@/api/endpoints/consolidationsApi', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('@/api/endpoints/consolidationsApi')>();
  return {
    ...actual,
    useListConsolidationsQuery: vi.fn(),
    useGetConsolidatableShippingInvoicesQuery: vi.fn(() => ({
      data: { shippingInvoices: [] },
      isLoading: false,
    })),
    useCreateConsolidationMutation: vi.fn(() => [
      vi.fn(),
      { isLoading: false, reset: vi.fn() },
    ]),
  };
});

const mockedUseGetMeQuery = vi.mocked(useGetMeQuery);
const mockedUseListConsolidationsQuery = vi.mocked(useListConsolidationsQuery);

describe('ConsolidationsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockedUseGetMeQuery.mockReturnValue({
      data: {
        user: createTestUser({
          memberships: [
            createMembership({
              effectivePermissions: [
                'viewConsolidations',
                'manageConsolidations',
              ],
            }),
          ],
        }),
      },
      isLoading: false,
      isFetching: false,
      refetch: vi.fn(),
    } as ReturnType<typeof useGetMeQuery>);

    mockedUseListConsolidationsQuery.mockReturnValue({
      data: {
        consolidations: [createConsolidationSummary()],
        pagination: { total: 1, limit: 20, offset: 0 },
      },
      isLoading: false,
      isFetching: false,
      refetch: vi.fn(),
    } as ReturnType<typeof useListConsolidationsQuery>);
  });

  it('renders consolidation list', () => {
    renderWithProviders(
      <Routes>
        <Route path="/app/consolidations" element={<ConsolidationsPage />} />
      </Routes>,
      {
        preloadedState: { auth: { activeCompanyId: COMPANY_ID } as never },
        route: '/app/consolidations',
      },
    );

    expect(screen.getByText('Consolidations')).toBeInTheDocument();
    expect(screen.getByText('TRK-001')).toBeInTheDocument();
    expect(screen.getByText('Create consolidation')).toBeInTheDocument();
  });

  it('queries participant direction', () => {
    renderWithProviders(
      <Routes>
        <Route path="/app/consolidations" element={<ConsolidationsPage />} />
      </Routes>,
      {
        preloadedState: { auth: { activeCompanyId: COMPANY_ID } as never },
        route: '/app/consolidations',
      },
    );

    expect(mockedUseListConsolidationsQuery).toHaveBeenCalledWith(
      expect.objectContaining({ direction: 'participant' }),
      expect.anything(),
    );
  });
});
