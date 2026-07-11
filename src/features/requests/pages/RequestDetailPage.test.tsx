import { describe, expect, it, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router-dom';

import { useGetMeQuery } from '@/api/endpoints/authApi';
import {
  useDeleteRequestLineMutation,
  useGetRequestQuery,
  useSubmitRequestMutation,
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
  useSubmitRequestMutation: vi.fn(),
  useDistributeRequestMutation: vi.fn(() => [
    vi.fn(),
    { isLoading: false, reset: vi.fn() },
  ]),
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
const mockedUseSubmitRequestMutation = vi.mocked(useSubmitRequestMutation);
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

  it('shows submit action for draft requests with manageRequests', () => {
    const submitMock = vi.fn();

    mockedUseGetRequestQuery.mockReturnValue({
      data: { request: createMaterialRequest({ status: 'DRAFT' }) },
      isLoading: false,
      isFetching: false,
      refetch: vi.fn(),
    } as ReturnType<typeof useGetRequestQuery>);

    mockedUseSubmitRequestMutation.mockReturnValue(
      mockMutationHook(submitMock) as ReturnType<
        typeof useSubmitRequestMutation
      >,
    );

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

    expect(screen.getByRole('button', { name: 'Submit' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Add line' })).toBeInTheDocument();
  });

  it('hides line actions for submitted requests', () => {
    mockedUseGetRequestQuery.mockReturnValue({
      data: { request: createMaterialRequest({ status: 'SUBMITTED' }) },
      isLoading: false,
      isFetching: false,
      refetch: vi.fn(),
    } as ReturnType<typeof useGetRequestQuery>);

    mockedUseSubmitRequestMutation.mockReturnValue(
      mockMutationHook(vi.fn()) as ReturnType<
        typeof useSubmitRequestMutation
      >,
    );

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
      screen.queryByRole('button', { name: 'Submit' }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Distribute' }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Add line' }),
    ).not.toBeInTheDocument();
  });

  it('calls submit mutation after confirmation', async () => {
    const user = userEvent.setup();
    const submitMock = vi.fn().mockReturnValue({
      unwrap: () => Promise.resolve({ request: createMaterialRequest({ status: 'SUBMITTED' }) }),
    });

    mockedUseGetRequestQuery.mockReturnValue({
      data: { request: createMaterialRequest({ status: 'DRAFT' }) },
      isLoading: false,
      isFetching: false,
      refetch: vi.fn(),
    } as ReturnType<typeof useGetRequestQuery>);

    mockedUseSubmitRequestMutation.mockReturnValue(
      mockMutationHook(submitMock) as ReturnType<
        typeof useSubmitRequestMutation
      >,
    );

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

    await user.click(screen.getByRole('button', { name: 'Submit' }));
    await user.click(
      screen.getAllByRole('button', { name: 'Submit' }).at(-1)!,
    );

    expect(submitMock).toHaveBeenCalledWith({
      companyId: COMPANY_ID,
      requestId: REQUEST_ID,
    });
  });
});
