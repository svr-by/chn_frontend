import { describe, expect, it, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router-dom';

import { useGetMeQuery } from '@/api/endpoints/authApi';
import {
  useDeleteRequestLineMutation,
  useGetInboundRequestQuery,
  useRejectInboundRequestMutation,
} from '@/api/endpoints/requestsApi';
import {
  useCreateQuoteMutation,
  useListQuotesQuery,
} from '@/api/endpoints/quotesApi';
import { InboundRequestDetailPage } from '@/features/requests/pages/inboundRequestDetailPage/InboundRequestDetailPage';
import {
  COMPANY_ID,
  createInboundMaterialRequest,
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

vi.mock('@/api/endpoints/requestsApi', () => ({
  useGetInboundRequestQuery: vi.fn(),
  useRejectInboundRequestMutation: vi.fn(),
  useAddRequestLineMutation: vi.fn(() => [
    vi.fn(),
    { isLoading: false, reset: vi.fn() },
  ]),
  useUpdateRequestLineMutation: vi.fn(() => [
    vi.fn(),
    { isLoading: false, reset: vi.fn() },
  ]),
  useDeleteRequestLineMutation: vi.fn(() => [
    vi.fn(),
    { isLoading: false, reset: vi.fn() },
  ]),
}));

vi.mock('@/api/endpoints/quotesApi', () => ({
  useListQuotesQuery: vi.fn(),
  useCreateQuoteMutation: vi.fn(),
}));

const mockedUseGetMeQuery = vi.mocked(useGetMeQuery);
const mockedUseGetInboundRequestQuery = vi.mocked(useGetInboundRequestQuery);
const mockedUseRejectInboundRequestMutation = vi.mocked(
  useRejectInboundRequestMutation,
);
const mockedUseListQuotesQuery = vi.mocked(useListQuotesQuery);
const mockedUseCreateQuoteMutation = vi.mocked(useCreateQuoteMutation);
const mockedUseDeleteRequestLineMutation = vi.mocked(
  useDeleteRequestLineMutation,
);

function renderPage() {
  return renderWithProviders(
    <Routes>
      <Route
        path="/app/requests/inbound/:requestId"
        element={<InboundRequestDetailPage />}
      />
      <Route path="/app/requests" element={<div>Inbound list</div>} />
    </Routes>,
    {
      preloadedState: { auth: { activeCompanyId: COMPANY_ID } as never },
      route: `/app/requests/inbound/${REQUEST_ID}`,
    },
  );
}

describe('InboundRequestDetailPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();

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

    mockedUseListQuotesQuery.mockReturnValue({
      data: { quotes: [], pagination: { total: 0, limit: 1, offset: 0 } },
      isLoading: false,
      isFetching: false,
      refetch: vi.fn(),
    } as ReturnType<typeof useListQuotesQuery>);

    mockedUseCreateQuoteMutation.mockReturnValue([
      vi.fn(),
      { isLoading: false, reset: vi.fn() },
    ] as ReturnType<typeof useCreateQuoteMutation>);

    mockedUseDeleteRequestLineMutation.mockReturnValue([
      vi.fn(),
      { isLoading: false, reset: vi.fn() },
    ] as ReturnType<typeof useDeleteRequestLineMutation>);
  });

  it(
    'renders assigned lines and rejects inbound requests',
    async () => {
    const user = userEvent.setup();
    const rejectInboundRequest = vi.fn().mockReturnValue({
      unwrap: () => Promise.resolve({ distribution: null }),
    });

    mockedUseRejectInboundRequestMutation.mockReturnValue([
      rejectInboundRequest,
      { isLoading: false, reset: vi.fn() },
    ] as ReturnType<typeof useRejectInboundRequestMutation>);

    renderPage();

    expect(
      screen.getByRole('heading', { name: 'Office supplies' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Buyer: Buyer Corp')).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Details' })).toBeInTheDocument();
    expect(screen.getByText('Test line')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Reject' }));
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
  },
    15_000,
  );
});
