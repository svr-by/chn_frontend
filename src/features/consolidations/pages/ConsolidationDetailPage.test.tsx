import { describe, expect, it, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import { Route, Routes } from 'react-router-dom';

import { useGetMeQuery } from '@/api/endpoints/authApi';
import {
  useGetConsolidatableShippingInvoicesQuery,
  useGetConsolidationQuery,
} from '@/api/endpoints/consolidationsApi';
import { ConsolidationDetailPage } from '@/features/consolidations/pages/ConsolidationDetailPage';
import {
  COMPANY_ID,
  CONSOLIDATION_ID,
  createConsolidation,
  createMembership,
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

vi.mock('@/api/endpoints/consolidationsApi', () => ({
  useGetConsolidationQuery: vi.fn(),
  useGetConsolidatableShippingInvoicesQuery: vi.fn(),
  useUpdateConsolidationMutation: vi.fn(() => [
    vi.fn(),
    { isLoading: false, reset: vi.fn() },
  ]),
  useAddConsolidationShippingInvoiceMutation: vi.fn(() => [
    vi.fn(),
    { isLoading: false, reset: vi.fn() },
  ]),
  useRemoveConsolidationShippingInvoiceMutation: vi.fn(() => [
    vi.fn(),
    { isLoading: false, reset: vi.fn() },
  ]),
  usePlanConsolidationMutation: vi.fn(() => [
    vi.fn(),
    { isLoading: false, reset: vi.fn() },
  ]),
  useMarkConsolidationInTransitMutation: vi.fn(() => [
    vi.fn(),
    { isLoading: false, reset: vi.fn() },
  ]),
  useMarkConsolidationCustomsMutation: vi.fn(() => [
    vi.fn(),
    { isLoading: false, reset: vi.fn() },
  ]),
  useMarkConsolidationDeliveredMutation: vi.fn(() => [
    vi.fn(),
    { isLoading: false, reset: vi.fn() },
  ]),
}));

const mockedUseGetMeQuery = vi.mocked(useGetMeQuery);
const mockedUseGetConsolidationQuery = vi.mocked(useGetConsolidationQuery);
const mockedUseGetConsolidatableShippingInvoicesQuery = vi.mocked(
  useGetConsolidatableShippingInvoicesQuery,
);

describe('ConsolidationDetailPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockedUseGetConsolidatableShippingInvoicesQuery.mockReturnValue({
      data: { shippingInvoices: [] },
      isLoading: false,
      isFetching: false,
      refetch: vi.fn(),
    } as ReturnType<typeof useGetConsolidatableShippingInvoicesQuery>);

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
  });

  it('shows plan action for DRAFT consolidation', () => {
    mockedUseGetConsolidationQuery.mockReturnValue({
      data: { consolidation: createConsolidation({ status: 'DRAFT' }) },
      isLoading: false,
      isFetching: false,
      refetch: vi.fn(),
    } as ReturnType<typeof useGetConsolidationQuery>);

    renderWithProviders(
      <Routes>
        <Route
          path="/app/consolidations/:consolidationId"
          element={<ConsolidationDetailPage />}
        />
      </Routes>,
      {
        preloadedState: { auth: { activeCompanyId: COMPANY_ID } as never },
        route: `/app/consolidations/${CONSOLIDATION_ID}`,
      },
    );

    expect(screen.getByText('Plan consolidation')).toBeInTheDocument();
    expect(screen.getByText('Add shipping invoice')).toBeInTheDocument();
  });

  it('shows mark in transit for PLANNED consolidation', () => {
    mockedUseGetConsolidationQuery.mockReturnValue({
      data: {
        consolidation: createConsolidation({
          status: 'PLANNED',
          plannedAt: '2026-01-02T00:00:00.000Z',
        }),
      },
      isLoading: false,
      isFetching: false,
      refetch: vi.fn(),
    } as ReturnType<typeof useGetConsolidationQuery>);

    renderWithProviders(
      <Routes>
        <Route
          path="/app/consolidations/:consolidationId"
          element={<ConsolidationDetailPage />}
        />
      </Routes>,
      {
        preloadedState: { auth: { activeCompanyId: COMPANY_ID } as never },
        route: `/app/consolidations/${CONSOLIDATION_ID}`,
      },
    );

    expect(screen.getByText('Mark in transit')).toBeInTheDocument();
    expect(screen.queryByText('Add shipping invoice')).not.toBeInTheDocument();
  });

  it('shows no actions for DELIVERED consolidation', () => {
    mockedUseGetConsolidationQuery.mockReturnValue({
      data: {
        consolidation: createConsolidation({
          status: 'DELIVERED',
          deliveredAt: '2026-01-05T00:00:00.000Z',
        }),
      },
      isLoading: false,
      isFetching: false,
      refetch: vi.fn(),
    } as ReturnType<typeof useGetConsolidationQuery>);

    renderWithProviders(
      <Routes>
        <Route
          path="/app/consolidations/:consolidationId"
          element={<ConsolidationDetailPage />}
        />
      </Routes>,
      {
        preloadedState: { auth: { activeCompanyId: COMPANY_ID } as never },
        route: `/app/consolidations/${CONSOLIDATION_ID}`,
      },
    );

    expect(screen.queryByText('Plan consolidation')).not.toBeInTheDocument();
    expect(screen.queryByText('Mark in transit')).not.toBeInTheDocument();
  });
});
