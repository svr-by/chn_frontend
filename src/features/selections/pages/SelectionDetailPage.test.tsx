import { describe, expect, it, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import { Route, Routes } from 'react-router-dom';

import { useGetMeQuery } from '@/api/endpoints/authApi';
import { useGetQuoteComparisonQuery } from '@/api/endpoints/requestsApi';
import { useGetSelectionQuery } from '@/api/endpoints/selectionsApi';
import { SelectionDetailPage } from '@/features/selections/pages/SelectionDetailPage';
import {
  COMPANY_ID,
  createMembership,
  createPurchaseSelection,
  createTestUser,
  SELECTION_ID,
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
  useGetRequestSelectionQuery: vi.fn(),
}));

vi.mock('@/api/endpoints/selectionsApi', () => ({
  useGetSelectionQuery: vi.fn(),
  useUpdateSelectionMutation: vi.fn(() => [
    vi.fn(),
    { isLoading: false, reset: vi.fn() },
  ]),
  useAddSelectionLineMutation: vi.fn(() => [
    vi.fn(),
    { isLoading: false, reset: vi.fn() },
  ]),
  useUpdateSelectionLineMutation: vi.fn(() => [
    vi.fn(),
    { isLoading: false, reset: vi.fn() },
  ]),
  useDeleteSelectionLineMutation: vi.fn(() => [
    vi.fn(),
    { isLoading: false, reset: vi.fn() },
  ]),
  useConfirmSelectionMutation: vi.fn(() => [
    vi.fn(),
    { isLoading: false, reset: vi.fn() },
  ]),
  useCancelSelectionMutation: vi.fn(() => [
    vi.fn(),
    { isLoading: false, reset: vi.fn() },
  ]),
}));

const mockedUseGetMeQuery = vi.mocked(useGetMeQuery);
const mockedUseGetSelectionQuery = vi.mocked(useGetSelectionQuery);
const mockedUseGetQuoteComparisonQuery = vi.mocked(useGetQuoteComparisonQuery);

describe('SelectionDetailPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockedUseGetQuoteComparisonQuery.mockReturnValue({
      data: { lines: [], request: null, suppliers: [] },
      isLoading: false,
      isFetching: false,
      refetch: vi.fn(),
    } as ReturnType<typeof useGetQuoteComparisonQuery>);
  });

  it('shows confirm action for DRAFT selection', () => {
    mockedUseGetSelectionQuery.mockReturnValue({
      data: { selection: createPurchaseSelection({ status: 'DRAFT' }) },
      isLoading: false,
      isFetching: false,
      refetch: vi.fn(),
    } as ReturnType<typeof useGetSelectionQuery>);

    mockedUseGetMeQuery.mockReturnValue({
      data: {
        user: createTestUser({
          memberships: [
            createMembership({
              effectivePermissions: ['viewSelections', 'manageSelections'],
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
          path="/app/selections/:selectionId"
          element={<SelectionDetailPage />}
        />
      </Routes>,
      {
        preloadedState: { auth: { activeCompanyId: COMPANY_ID } as never },
        route: `/app/selections/${SELECTION_ID}`,
      },
    );

    expect(screen.getByText('Confirm selection')).toBeInTheDocument();
  });

  it('hides edit actions for CONFIRMED selection', () => {
    mockedUseGetSelectionQuery.mockReturnValue({
      data: {
        selection: createPurchaseSelection({
          status: 'CONFIRMED',
          confirmedAt: '2026-01-02T00:00:00.000Z',
        }),
      },
      isLoading: false,
      isFetching: false,
      refetch: vi.fn(),
    } as ReturnType<typeof useGetSelectionQuery>);

    mockedUseGetMeQuery.mockReturnValue({
      data: {
        user: createTestUser({
          memberships: [
            createMembership({
              effectivePermissions: ['viewSelections', 'manageSelections'],
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
          path="/app/selections/:selectionId"
          element={<SelectionDetailPage />}
        />
      </Routes>,
      {
        preloadedState: { auth: { activeCompanyId: COMPANY_ID } as never },
        route: `/app/selections/${SELECTION_ID}`,
      },
    );

    expect(screen.queryByText('Confirm selection')).not.toBeInTheDocument();
    expect(screen.queryByText('Add line')).not.toBeInTheDocument();
    expect(screen.getByText('View invoices')).toBeInTheDocument();
  });
});
