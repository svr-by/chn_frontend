import { describe, expect, it, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';

import { useGetMeQuery } from '@/api/endpoints/authApi';
import { useDeleteRequestMutation } from '@/api/endpoints/requestsApi';
import { RequestStatusActions } from '@/features/requests/components/RequestStatusActions';
import {
  COMPANY_ID,
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
  useDeleteRequestMutation: vi.fn(),
}));

const mockedUseGetMeQuery = vi.mocked(useGetMeQuery);
const mockedUseDeleteRequestMutation = vi.mocked(useDeleteRequestMutation);

describe('RequestStatusActions', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockedUseDeleteRequestMutation.mockReturnValue([
      vi.fn(),
      { isLoading: false, reset: vi.fn() },
    ] as ReturnType<typeof useDeleteRequestMutation>);
  });

  it('shows delete button on DRAFT status with manageRequests', () => {
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

    expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument();
  });

  it('hides actions when status is not DRAFT', () => {
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

    expect(
      screen.queryByRole('button', { name: 'Delete' }),
    ).not.toBeInTheDocument();
  });

  it('hides delete button without manageRequests', () => {
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
        status="DRAFT"
      />,
      { preloadedState: { auth: { activeCompanyId: COMPANY_ID } as never } },
    );

    expect(
      screen.queryByRole('button', { name: 'Delete' }),
    ).not.toBeInTheDocument();
  });
});
