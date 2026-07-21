import { describe, expect, it, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';

import { useGetMeQuery } from '@/api/endpoints/authApi';
import {
  useDeleteRequestMutation,
  useDistributeRequestMutation,
} from '@/api/endpoints/requestsApi';
import { RequestStatusActions } from '@/features/requests/components/RequestStatusActions';
import {
  COMPANY_ID,
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

vi.mock('@/api/endpoints/partnersApi', () => ({
  useListPartnersQuery: vi.fn(() => ({
    data: { partners: [] },
    isLoading: false,
    isFetching: false,
    refetch: vi.fn(),
  })),
}));

vi.mock('@/api/endpoints/requestsApi', () => ({
  useDeleteRequestMutation: vi.fn(),
  useDistributeRequestMutation: vi.fn(),
}));

vi.mock('@/features/selections/hooks/useOpenRequestSelection', () => ({
  useOpenRequestSelection: vi.fn(() => ({
    openRequestSelection: vi.fn(),
    isOpening: false,
    error: null,
  })),
}));

const mockedUseGetMeQuery = vi.mocked(useGetMeQuery);
const mockedUseDeleteRequestMutation = vi.mocked(useDeleteRequestMutation);
const mockedUseDistributeRequestMutation = vi.mocked(useDistributeRequestMutation);

describe('RequestStatusActions', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockedUseDeleteRequestMutation.mockReturnValue([
      vi.fn(),
      { isLoading: false, reset: vi.fn() },
    ] as ReturnType<typeof useDeleteRequestMutation>);

    mockedUseDistributeRequestMutation.mockReturnValue([
      vi.fn(),
      { isLoading: false, reset: vi.fn() },
    ] as ReturnType<typeof useDistributeRequestMutation>);
  });

  it('shows send-to-suppliers button on DRAFT status', () => {
    mockedUseGetMeQuery.mockReturnValue({
      data: {
        user: createTestUser({
          memberships: [
            createMembership({
              effectivePermissions: ['manageRequests'],
            }),
          ],
        }),
      },
      isLoading: false,
      isFetching: false,
      refetch: vi.fn(),
    } as ReturnType<typeof useGetMeQuery>);

    renderWithProviders(
      <RequestStatusActions
        companyId={COMPANY_ID}
        requestId={REQUEST_ID}
        status="DRAFT"
      />,
      { preloadedState: { auth: { activeCompanyId: COMPANY_ID } as never } },
    );

    expect(
      screen.getByRole('button', { name: 'Send to suppliers' }),
    ).toBeInTheDocument();
  });

  it('shows compare link on QUOTING status', () => {
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
      <RequestStatusActions
        companyId={COMPANY_ID}
        requestId={REQUEST_ID}
        status="QUOTING"
      />,
      { preloadedState: { auth: { activeCompanyId: COMPANY_ID } as never } },
    );

    expect(
      screen.getByRole('link', { name: 'Compare quotes' }),
    ).toHaveAttribute('href', `/app/requests/${REQUEST_ID}/compare`);
  });

  it('shows manage selection button on QUOTING with manageSelections', () => {
    mockedUseGetMeQuery.mockReturnValue({
      data: {
        user: createTestUser({
          memberships: [
            createMembership({
              effectivePermissions: ['viewRequests', 'manageSelections'],
            }),
          ],
        }),
      },
      isLoading: false,
      isFetching: false,
      refetch: vi.fn(),
    } as ReturnType<typeof useGetMeQuery>);

    renderWithProviders(
      <RequestStatusActions
        companyId={COMPANY_ID}
        requestId={REQUEST_ID}
        status="QUOTING"
      />,
      { preloadedState: { auth: { activeCompanyId: COMPANY_ID } as never } },
    );

    expect(
      screen.getByRole('button', { name: 'Manage selection' }),
    ).toBeInTheDocument();
  });

  it('shows add-suppliers action on QUOTING with manageRequests', () => {
    mockedUseGetMeQuery.mockReturnValue({
      data: {
        user: createTestUser({
          memberships: [
            createMembership({
              effectivePermissions: ['manageRequests'],
            }),
          ],
        }),
      },
      isLoading: false,
      isFetching: false,
      refetch: vi.fn(),
    } as ReturnType<typeof useGetMeQuery>);

    renderWithProviders(
      <RequestStatusActions
        companyId={COMPANY_ID}
        requestId={REQUEST_ID}
        status="QUOTING"
      />,
      { preloadedState: { auth: { activeCompanyId: COMPANY_ID } as never } },
    );

    expect(screen.getByRole('button', { name: 'Add suppliers' })).toBeInTheDocument();
  });

  it('hides delete button when status is not DRAFT', () => {
    mockedUseGetMeQuery.mockReturnValue({
      data: {
        user: createTestUser({
          memberships: [
            createMembership({
              effectivePermissions: ['manageRequests'],
            }),
          ],
        }),
      },
      isLoading: false,
      isFetching: false,
      refetch: vi.fn(),
    } as ReturnType<typeof useGetMeQuery>);

    renderWithProviders(
      <RequestStatusActions
        companyId={COMPANY_ID}
        requestId={REQUEST_ID}
        status="QUOTING"
      />,
      { preloadedState: { auth: { activeCompanyId: COMPANY_ID } as never } },
    );

    expect(screen.queryByRole('button', { name: 'Delete' })).not.toBeInTheDocument();
  });
});
