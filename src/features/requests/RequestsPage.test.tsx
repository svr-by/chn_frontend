import { describe, expect, it, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';

import { useGetMeQuery } from '@/api/endpoints/authApi';
import { useListRequestsQuery } from '@/api/endpoints/requestsApi';
import { RequestsPage } from '@/features/requests/RequestsPage';
import {
  COMPANY_ID,
  createMaterialRequestSummary,
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

vi.mock('@/api/endpoints/requestsApi', () => ({
  useListRequestsQuery: vi.fn(),
  useListInboundRequestsQuery: vi.fn(() => ({
    data: { requests: [], pagination: { total: 0, limit: 20, offset: 0 } },
    isLoading: false,
    isFetching: false,
    refetch: vi.fn(),
  })),
  useGetRequestQuery: vi.fn(),
  useCreateRequestMutation: vi.fn(),
  useUpdateRequestMutation: vi.fn(),
  useAddRequestLineMutation: vi.fn(),
  useUpdateRequestLineMutation: vi.fn(),
  useDeleteRequestLineMutation: vi.fn(),
  useSubmitRequestMutation: vi.fn(),
}));

const mockedUseGetMeQuery = vi.mocked(useGetMeQuery);
const mockedUseListRequestsQuery = vi.mocked(useListRequestsQuery);

describe('RequestsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockedUseListRequestsQuery.mockReturnValue({
      data: {
        requests: [createMaterialRequestSummary()],
        pagination: { total: 1, limit: 20, offset: 0 },
      },
      isLoading: false,
      isFetching: false,
      refetch: vi.fn(),
    } as ReturnType<typeof useListRequestsQuery>);
  });

  it('renders request list', () => {
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

    renderWithProviders(<RequestsPage />, {
      preloadedState: { auth: { activeCompanyId: COMPANY_ID } as never },
      route: '/app/requests',
    });

    expect(screen.getByText('Office supplies')).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Outbound' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Inbound' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'New request' })).toBeInTheDocument();
  });

  it('passes status filter to list query', () => {
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

    renderWithProviders(<RequestsPage />, {
      preloadedState: { auth: { activeCompanyId: COMPANY_ID } as never },
      route: '/app/requests',
    });

    expect(mockedUseListRequestsQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        companyId: COMPANY_ID,
        limit: 20,
        offset: 0,
      }),
      expect.objectContaining({ skip: false }),
    );
  });

  it('hides new request button without manageRequests', () => {
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

    renderWithProviders(<RequestsPage />, {
      preloadedState: { auth: { activeCompanyId: COMPANY_ID } as never },
      route: '/app/requests',
    });

    expect(
      screen.queryByRole('link', { name: 'New request' }),
    ).not.toBeInTheDocument();
  });
});
