import { describe, expect, it, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router-dom';

import { useGetMeQuery } from '@/api/endpoints/authApi';
import {
  useDeleteRequestLineMutation,
  useGetInboundRequestQuery,
  useGetRequestQuery,
  useRejectInboundRequestMutation,
  useUpdateRequestMutation,
} from '@/api/endpoints/requestsApi';
import {
  useCreateQuoteMutation,
  useListQuotesQuery,
} from '@/api/endpoints/quotesApi';
import { RequestDetailPage } from '@/features/requests/pages/requestDetailPage/RequestDetailPage';
import {
  COMPANY_ID,
  createInboundMaterialRequest,
  createMaterialRequest,
  createMembership,
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

vi.mock('@/api/endpoints/productsApi', () => ({
  useListProductsQuery: vi.fn(() => ({
    data: { products: [], pagination: { total: 0, limit: 20, offset: 0 } },
    isLoading: false,
    isFetching: false,
    refetch: vi.fn(),
  })),
}));

vi.mock('@/api/endpoints/membersApi', () => ({
  useListMembersQuery: vi.fn(() => ({
    data: { members: [] },
    isLoading: false,
    isFetching: false,
    refetch: vi.fn(),
  })),
}));

vi.mock('@/api/endpoints/requestsApi', () => {
  const emptyDistributions = { distributions: [] as const };
  const emptyQuoteComparison = {
    request: {
      id: '00000000-0000-0000-0000-000000000050',
      title: 'Empty request',
      status: 'QUOTING' as const,
    },
    lines: [] as const,
  };

  return {
    useGetRequestQuery: vi.fn(),
    useGetInboundRequestQuery: vi.fn(),
    useUpdateRequestMutation: vi.fn(),
    useRejectInboundRequestMutation: vi.fn(),
    useAddRequestLineMutation: vi.fn(() => [
      vi.fn(),
      { isLoading: false, reset: vi.fn() },
    ]),
    useUpdateRequestLineMutation: vi.fn(() => [
      vi.fn(),
      { isLoading: false, reset: vi.fn() },
    ]),
    useDeleteRequestLineMutation: vi.fn(),
    useDeleteRequestMutation: vi.fn(() => [
      vi.fn(),
      { isLoading: false, reset: vi.fn() },
    ]),
    useCloseRequestMutation: vi.fn(() => [
      vi.fn(),
      { isLoading: false, reset: vi.fn() },
    ]),
    useDistributeRequestMutation: vi.fn(() => [
      vi.fn(),
      { isLoading: false, reset: vi.fn() },
    ]),
    useUpdateRequestDistributionMutation: vi.fn(() => [
      vi.fn(),
      { isLoading: false, reset: vi.fn(), error: undefined },
    ]),
    useDeleteRequestDistributionMutation: vi.fn(() => [
      vi.fn(),
      { isLoading: false, reset: vi.fn(), error: undefined },
    ]),
    useGetRequestDistributionsQuery: vi.fn(() => ({
      data: emptyDistributions,
      isLoading: false,
      isFetching: false,
      refetch: vi.fn(),
    })),
    useListRequestsQuery: vi.fn(),
    useCreateRequestMutation: vi.fn(),
    useListInboundRequestsQuery: vi.fn(() => ({
      data: { requests: [], pagination: { total: 0, limit: 100, offset: 0 } },
      isLoading: false,
      isFetching: false,
      refetch: vi.fn(),
    })),
    useGetQuoteComparisonQuery: vi.fn(() => ({
      data: emptyQuoteComparison,
      isLoading: false,
      isFetching: false,
      refetch: vi.fn(),
    })),
  };
});

vi.mock('@/api/endpoints/partnersApi', () => ({
  useListPartnersQuery: vi.fn(() => ({
    data: { partners: [] },
    isLoading: false,
    isFetching: false,
    refetch: vi.fn(),
  })),
}));

vi.mock('@/api/endpoints/quotesApi', () => ({
  useListQuotesQuery: vi.fn(),
  useLazyListQuotesQuery: vi.fn(() => [
    vi.fn(),
    { isLoading: false, reset: vi.fn() },
  ]),
  useCreateQuoteMutation: vi.fn(),
}));

const mockedUseGetMeQuery = vi.mocked(useGetMeQuery);
const mockedUseGetRequestQuery = vi.mocked(useGetRequestQuery);
const mockedUseGetInboundRequestQuery = vi.mocked(useGetInboundRequestQuery);
const mockedUseUpdateRequestMutation = vi.mocked(useUpdateRequestMutation);
const mockedUseDeleteRequestLineMutation = vi.mocked(
  useDeleteRequestLineMutation,
);
const mockedUseRejectInboundRequestMutation = vi.mocked(
  useRejectInboundRequestMutation,
);
const mockedUseListQuotesQuery = vi.mocked(useListQuotesQuery);
const mockedUseCreateQuoteMutation = vi.mocked(useCreateQuoteMutation);

function mockMutationHook(mock: ReturnType<typeof vi.fn>) {
  return [mock, { isLoading: false, reset: vi.fn() }] as const;
}

function mockIdleQuery() {
  return {
    data: undefined,
    isLoading: false,
    isFetching: false,
    refetch: vi.fn(),
  };
}

function renderOutboundPage() {
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

function renderInboundPage() {
  return renderWithProviders(
    <Routes>
      <Route
        path="/app/requests/inbound/:requestId"
        element={<RequestDetailPage />}
      />
      <Route path="/app/requests" element={<div>Inbound list</div>} />
    </Routes>,
    {
      preloadedState: { auth: { activeCompanyId: COMPANY_ID } as never },
      route: `/app/requests/inbound/${REQUEST_ID}`,
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
    mockedUseGetInboundRequestQuery.mockReturnValue(
      mockIdleQuery() as ReturnType<typeof useGetInboundRequestQuery>,
    );
    mockedUseGetRequestQuery.mockReturnValue(
      mockIdleQuery() as ReturnType<typeof useGetRequestQuery>,
    );
    mockedUseListQuotesQuery.mockReturnValue({
      data: { quotes: [], pagination: { total: 0, limit: 1, offset: 0 } },
      isLoading: false,
      isFetching: false,
      refetch: vi.fn(),
    } as ReturnType<typeof useListQuotesQuery>);
    mockedUseCreateQuoteMutation.mockReturnValue(
      mockMutationHook(vi.fn()) as ReturnType<typeof useCreateQuoteMutation>,
    );
    mockedUseRejectInboundRequestMutation.mockReturnValue(
      mockMutationHook(vi.fn()) as ReturnType<
        typeof useRejectInboundRequestMutation
      >,
    );
  });

  it('shows add-supplier action for draft requests with manageRequests', async () => {
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

    renderOutboundPage();

    expect(screen.getByRole('button', { name: 'Add' })).toBeInTheDocument();

    await user.click(screen.getByRole('tab', { name: 'Suppliers' }));

    expect(
      screen.getByRole('button', { name: 'Add supplier' }),
    ).toBeInTheDocument();
  });

  it('keeps line actions and shows add supplier for quoting requests', async () => {
    const user = userEvent.setup();

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

    renderOutboundPage();

    expect(screen.getByRole('button', { name: 'Add' })).toBeInTheDocument();

    await user.click(screen.getByRole('tab', { name: 'Suppliers' }));

    expect(
      screen.getByRole('button', { name: 'Add supplier' }),
    ).toBeInTheDocument();
  });

  it('shows request status from the latest getRequest payload', () => {
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

    mockedUseGetRequestQuery.mockReturnValue({
      data: { request: createMaterialRequest({ status: 'ORDERED' }) },
      isLoading: false,
      isFetching: false,
      refetch: vi.fn(),
    } as ReturnType<typeof useGetRequestQuery>);

    const view = renderOutboundPage();
    expect(screen.getByText('Ordered')).toBeInTheDocument();

    mockedUseGetRequestQuery.mockReturnValue({
      data: {
        request: createMaterialRequest({ status: 'PARTIALLY_ORDERED' }),
      },
      isLoading: false,
      isFetching: false,
      refetch: vi.fn(),
    } as ReturnType<typeof useGetRequestQuery>);

    view.rerender(
      <Routes>
        <Route path="/app/requests/:requestId" element={<RequestDetailPage />} />
      </Routes>,
    );

    expect(screen.getByText('Partially ordered')).toBeInTheDocument();
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

    renderOutboundPage();

    await user.click(screen.getByRole('tab', { name: 'Suppliers' }));
    await user.click(screen.getByRole('button', { name: 'Add supplier' }));

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Distribute to suppliers')).toBeInTheDocument();
  });

  it('renders inbound request details and rejects from actions menu', async () => {
    const user = userEvent.setup();
    const rejectInboundRequest = vi.fn().mockReturnValue({
      unwrap: () => Promise.resolve({ distribution: null }),
    });

    mockedUseGetMeQuery.mockReturnValue({
      data: {
        user: createTestUser({
          memberships: [
            createMembership({
              effectivePermissions: ['viewQuotes', 'manageQuotes'],
            }),
          ],
        }),
      },
      isLoading: false,
      isFetching: false,
      refetch: vi.fn(),
    } as ReturnType<typeof useGetMeQuery>);

    mockedUseGetInboundRequestQuery.mockReturnValue({
      data: { request: createInboundMaterialRequest() },
      isLoading: false,
      isFetching: false,
      refetch: vi.fn(),
    } as ReturnType<typeof useGetInboundRequestQuery>);

    mockedUseRejectInboundRequestMutation.mockReturnValue([
      rejectInboundRequest,
      { isLoading: false, reset: vi.fn() },
    ] as ReturnType<typeof useRejectInboundRequestMutation>);

    renderInboundPage();

    expect(
      screen.getByRole('heading', { name: 'Request Office supplies' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Buyer: Buyer Corp')).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Details' })).toBeInTheDocument();
    expect(
      screen.queryByRole('tab', { name: 'Suppliers' }),
    ).not.toBeInTheDocument();
    expect(screen.getByText('Test line')).toBeInTheDocument();

    await user.click(
      screen.getAllByRole('button', { name: 'More actions' })[0]!,
    );
    await user.click(screen.getByRole('menuitem', { name: 'Reject' }));
    await user.type(
      screen.getByLabelText('Reason (optional)'),
      'Not available',
    );
    await user.click(screen.getAllByRole('button', { name: 'Reject' }).at(-1)!);

    await waitFor(() => {
      expect(rejectInboundRequest).toHaveBeenCalledWith({
        companyId: COMPANY_ID,
        requestId: REQUEST_ID,
        reason: 'Not available',
      });
    });
  }, 15_000);
});
