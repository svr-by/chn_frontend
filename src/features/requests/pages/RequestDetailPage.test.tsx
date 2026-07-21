import { describe, expect, it, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router-dom';

import { useGetMeQuery } from '@/api/endpoints/authApi';
import {
  useDeleteRequestLineMutation,
  useGetRequestQuery,
  useUpdateRequestMutation,
} from '@/api/endpoints/requestsApi';
import { RequestDetailPage } from '@/features/requests/pages/RequestDetailPage';
import {
  COMPANY_ID,
  createMaterialRequest,
  createMembership,
  createTestUser,
  REQUEST_ID,
} from '@/test/fixtures';
import { renderWithProviders } from '@/test/render';

vi.mock('@/api/endpoints/authApi', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/api/endpoints/authApi')>();
  return {
    ...actual,
    useGetMeQuery: vi.fn(),
  };
});

vi.mock('@/api/endpoints/productsApi', () => ({
  useListProductsQuery: vi.fn(() => ({
    data: { products: [], pagination: { total: 0, limit: 20, offset: 0 } },
    isLoading: false,
    isFetching: false,
    refetch: vi.fn(),
  })),
}));

vi.mock('@/api/endpoints/requestsApi', () => ({
  useGetRequestQuery: vi.fn(),
  useUpdateRequestMutation: vi.fn(),
  useAddRequestLineMutation: vi.fn(() => [vi.fn(), { isLoading: false, reset: vi.fn() }]),
  useUpdateRequestLineMutation: vi.fn(() => [vi.fn(), { isLoading: false, reset: vi.fn() }]),
  useDeleteRequestLineMutation: vi.fn(),
  useDeleteRequestMutation: vi.fn(() => [
    vi.fn(),
    { isLoading: false, reset: vi.fn() },
  ]),
  useDistributeRequestMutation: vi.fn(() => [
    vi.fn(),
    { isLoading: false, reset: vi.fn() },
  ]),
  useGetRequestDistributionsQuery: vi.fn(() => ({
    data: { distributions: [] },
    isLoading: false,
    isFetching: false,
    refetch: vi.fn(),
  })),
  useListRequestsQuery: vi.fn(),
  useCreateRequestMutation: vi.fn(),
  useListInboundRequestsQuery: vi.fn(),
  useGetQuoteComparisonQuery: vi.fn(),
  useGetRequestSelectionQuery: vi.fn(() => ({
    data: undefined,
    isLoading: false,
    isFetching: false,
    refetch: vi.fn(),
  })),
}));

vi.mock('@/api/endpoints/partnersApi', () => ({
  useListPartnersQuery: vi.fn(() => ({
    data: { partners: [] },
    isLoading: false,
    isFetching: false,
    refetch: vi.fn(),
  })),
}));

vi.mock('@/features/selections/hooks/useOpenRequestSelection', () => ({
  useOpenRequestSelection: vi.fn(() => ({
    openRequestSelection: vi.fn(),
    isOpening: false,
    error: null,
  })),
}));

const mockedUseGetMeQuery = vi.mocked(useGetMeQuery);
const mockedUseGetRequestQuery = vi.mocked(useGetRequestQuery);
const mockedUseUpdateRequestMutation = vi.mocked(useUpdateRequestMutation);
const mockedUseDeleteRequestLineMutation = vi.mocked(
  useDeleteRequestLineMutation,
);

function mockMutationHook(mock: ReturnType<typeof vi.fn>) {
  return [mock, { isLoading: false, reset: vi.fn() }] as const;
}

function renderDetailPage() {
  return renderWithProviders(
    <Routes>
      <Route path="/app/requests/:requestId" element={<RequestDetailPage />} />
    </Routes>,
    {
      preloadedState: { auth: { activeCompanyId: COMPANY_ID } as never },
      route: `/app/requests/${REQUEST_ID}`,
    },
  );
}

describe('RequestDetailPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockedUseUpdateRequestMutation.mockReturnValue(
      mockMutationHook(vi.fn()) as ReturnType<typeof useUpdateRequestMutation>,
    );
    mockedUseDeleteRequestLineMutation.mockReturnValue(
      mockMutationHook(vi.fn()) as ReturnType<
        typeof useDeleteRequestLineMutation
      >,
    );
  });

  it('shows send-to-suppliers action for draft requests with manageRequests', () => {
    mockedUseGetRequestQuery.mockReturnValue({
      data: { request: createMaterialRequest({ status: 'DRAFT' }) },
      isLoading: false,
      isFetching: false,
      refetch: vi.fn(),
    } as ReturnType<typeof useGetRequestQuery>);

    mockedUseGetMeQuery.mockReturnValue({
      data: {
        user: createTestUser({
          memberships: [
            createMembership({
              effectivePermissions: ['viewRequests', 'manageRequests'],
            }),
          ],
        }),
      },
      isLoading: false,
      isFetching: false,
      refetch: vi.fn(),
    } as ReturnType<typeof useGetMeQuery>);

    renderDetailPage();

    expect(
      screen.getByRole('button', { name: 'Send to suppliers' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Add line' })).toBeInTheDocument();
  });

  it('hides line actions and shows add suppliers for quoting requests', () => {
    mockedUseGetRequestQuery.mockReturnValue({
      data: { request: createMaterialRequest({ status: 'QUOTING' }) },
      isLoading: false,
      isFetching: false,
      refetch: vi.fn(),
    } as ReturnType<typeof useGetRequestQuery>);

    mockedUseGetMeQuery.mockReturnValue({
      data: {
        user: createTestUser({
          memberships: [
            createMembership({
              effectivePermissions: ['viewRequests', 'manageRequests'],
            }),
          ],
        }),
      },
      isLoading: false,
      isFetching: false,
      refetch: vi.fn(),
    } as ReturnType<typeof useGetMeQuery>);

    renderDetailPage();

    expect(
      screen.queryByRole('button', { name: 'Send to suppliers' }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Add suppliers' }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Add line' }),
    ).not.toBeInTheDocument();
  });

  it('opens distribute dialog from draft requests', async () => {
    const user = userEvent.setup();

    mockedUseGetRequestQuery.mockReturnValue({
      data: { request: createMaterialRequest({ status: 'DRAFT' }) },
      isLoading: false,
      isFetching: false,
      refetch: vi.fn(),
    } as ReturnType<typeof useGetRequestQuery>);

    mockedUseGetMeQuery.mockReturnValue({
      data: {
        user: createTestUser({
          memberships: [
            createMembership({
              effectivePermissions: ['viewRequests', 'manageRequests'],
            }),
          ],
        }),
      },
      isLoading: false,
      isFetching: false,
      refetch: vi.fn(),
    } as ReturnType<typeof useGetMeQuery>);

    renderDetailPage();

    await user.click(screen.getByRole('button', { name: 'Send to suppliers' }));

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Distribute to suppliers')).toBeInTheDocument();
  });
});
