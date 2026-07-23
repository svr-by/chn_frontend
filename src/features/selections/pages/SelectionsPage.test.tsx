import { describe, expect, it, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';

import { useGetMeQuery } from '@/api/endpoints/authApi';
import { useListSelectionsQuery } from '@/api/endpoints/selectionsApi';
import { SelectionsPage } from '@/features/selections/pages/SelectionsPage';
import {
  COMPANY_ID,
  createMembership,
  createPurchaseSelectionSummary,
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

vi.mock('@/api/endpoints/selectionsApi', () => ({
  useListSelectionsQuery: vi.fn(),
  useGetSelectionQuery: vi.fn(),
  useCreateSelectionMutation: vi.fn(),
  useUpdateSelectionMutation: vi.fn(),
  useAddSelectionLineMutation: vi.fn(),
  useUpdateSelectionLineMutation: vi.fn(),
  useDeleteSelectionLineMutation: vi.fn(),
  useConfirmSelectionMutation: vi.fn(),
  useCancelSelectionMutation: vi.fn(),
}));

const mockedUseGetMeQuery = vi.mocked(useGetMeQuery);
const mockedUseListSelectionsQuery = vi.mocked(useListSelectionsQuery);

describe('SelectionsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockedUseListSelectionsQuery.mockReturnValue({
      data: {
        selections: [createPurchaseSelectionSummary()],
        pagination: { total: 1, limit: 20, offset: 0 },
      },
      isLoading: false,
      isFetching: false,
      refetch: vi.fn(),
    } as ReturnType<typeof useListSelectionsQuery>);
  });

  it('renders selection list', () => {
    mockedUseGetMeQuery.mockReturnValue({
      data: {
        user: createTestUser({
          memberships: [
            createMembership({
              effectivePermissions: ['viewSelections'],
            }),
          ],
        }),
      },
      isLoading: false,
      isFetching: false,
      refetch: vi.fn(),
    } as ReturnType<typeof useGetMeQuery>);

    renderWithProviders(<SelectionsPage />, {
      preloadedState: { auth: { activeCompanyId: COMPANY_ID } as never },
      route: '/app/selections',
    });

    expect(screen.getByText('Draft')).toBeInTheDocument();
    expect(screen.getByText('00000000')).toBeInTheDocument();
  });
});
