import { describe, expect, it, vi, beforeEach } from 'vitest';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router-dom';

import { useGetMeQuery } from '@/api/endpoints/authApi';
import { useListMembersQuery } from '@/api/endpoints/membersApi';
import { useListPartnersQuery } from '@/api/endpoints/partnersApi';
import {
  useListInboundRequestsQuery,
  useListRequestsQuery,
} from '@/api/endpoints/requestsApi';
import { RequestsPage } from '@/features/requests/pages/requestsPage/RequestsPage';
import { DEFAULT_PAGE_SIZE } from '@/lib/pagination';
import {
  PREFERRED_TRADING_ROLE_STORAGE_KEY,
  readPreferredTradingRole,
} from '@/lib/preferredDirection';
import {
  COMPANY_ID,
  createInboundMaterialRequestSummary,
  createMaterialRequestSummary,
  createMembership,
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

vi.mock('@/api/endpoints/membersApi', () => ({
  useListMembersQuery: vi.fn(),
}));

vi.mock('@/api/endpoints/partnersApi', () => ({
  useListPartnersQuery: vi.fn(),
}));

vi.mock('@/api/endpoints/requestsApi', () => ({
  useListRequestsQuery: vi.fn(),
  useListInboundRequestsQuery: vi.fn(),
  useGetRequestQuery: vi.fn(),
  useCreateRequestMutation: vi.fn(),
  useUpdateRequestMutation: vi.fn(),
  useAddRequestLineMutation: vi.fn(),
  useUpdateRequestLineMutation: vi.fn(),
  useDeleteRequestLineMutation: vi.fn(),
}));

const mockedUseGetMeQuery = vi.mocked(useGetMeQuery);
const mockedUseListMembersQuery = vi.mocked(useListMembersQuery);
const mockedUseListPartnersQuery = vi.mocked(useListPartnersQuery);
const mockedUseListRequestsQuery = vi.mocked(useListRequestsQuery);
const mockedUseListInboundRequestsQuery = vi.mocked(
  useListInboundRequestsQuery,
);

async function openFilters(
  user: ReturnType<typeof userEvent.setup>,
): Promise<void> {
  await user.click(screen.getByRole('button', { name: 'Filters' }));
}

function mockManageUser() {
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
}

function mockViewOnlyUser() {
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
}

describe('RequestsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.removeItem(PREFERRED_TRADING_ROLE_STORAGE_KEY);

    mockedUseListMembersQuery.mockReturnValue({
      data: { members: [] },
      isLoading: false,
      isFetching: false,
      refetch: vi.fn(),
    } as ReturnType<typeof useListMembersQuery>);

    mockedUseListPartnersQuery.mockReturnValue({
      data: { partners: [] },
      isLoading: false,
      isFetching: false,
      refetch: vi.fn(),
    } as ReturnType<typeof useListPartnersQuery>);

    mockedUseListRequestsQuery.mockReturnValue({
      data: {
        requests: [createMaterialRequestSummary()],
        pagination: { total: 1, limit: DEFAULT_PAGE_SIZE, offset: 0 },
      },
      isLoading: false,
      isFetching: false,
      refetch: vi.fn(),
    } as ReturnType<typeof useListRequestsQuery>);

    mockedUseListInboundRequestsQuery.mockReturnValue({
      data: {
        requests: [createInboundMaterialRequestSummary()],
        pagination: { total: 1, limit: DEFAULT_PAGE_SIZE, offset: 0 },
      },
      isLoading: false,
      isFetching: false,
      refetch: vi.fn(),
    } as ReturnType<typeof useListInboundRequestsQuery>);
  });

  it('renders outbound request cards', () => {
    mockManageUser();

    renderWithProviders(
      <Routes>
        <Route path="/app/requests" element={<RequestsPage />} />
      </Routes>,
      {
        preloadedState: { auth: { activeCompanyId: COMPANY_ID } as never },
        route: '/app/requests',
      },
    );

    expect(screen.getByText('Request Office supplies')).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Outbound' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Inbound' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Filters' })).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'New request' }),
    ).toBeInTheDocument();
    expect(mockedUseListRequestsQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        companyId: COMPANY_ID,
        limit: DEFAULT_PAGE_SIZE,
        offset: 0,
      }),
      expect.objectContaining({ skip: false }),
    );
  });

  it('switches to inbound tab', async () => {
    const user = userEvent.setup();
    mockViewOnlyUser();

    renderWithProviders(
      <Routes>
        <Route path="/app/requests" element={<RequestsPage />} />
      </Routes>,
      {
        preloadedState: { auth: { activeCompanyId: COMPANY_ID } as never },
        route: '/app/requests',
      },
    );

    await user.click(screen.getByRole('tab', { name: 'Inbound' }));

    expect(await screen.findByText('Buyer Corp')).toBeInTheDocument();
    expect(
      screen.queryByRole('link', { name: 'New request' }),
    ).not.toBeInTheDocument();
    expect(mockedUseListInboundRequestsQuery).toHaveBeenCalledWith(
      expect.objectContaining({ companyId: COMPANY_ID }),
      expect.objectContaining({ skip: false }),
    );
    expect(readPreferredTradingRole()).toBe('supplier');
  });

  it('applies status filter only after Apply', async () => {
    const user = userEvent.setup();
    mockViewOnlyUser();

    renderWithProviders(
      <Routes>
        <Route path="/app/requests" element={<RequestsPage />} />
      </Routes>,
      {
        preloadedState: { auth: { activeCompanyId: COMPANY_ID } as never },
        route: '/app/requests',
      },
    );

    await openFilters(user);

    expect(screen.getByRole('button', { name: 'Apply' })).toBeDisabled();

    await user.click(screen.getByLabelText('Status'));
    await user.click(await screen.findByRole('option', { name: 'Quoting' }));

    expect(screen.getByRole('button', { name: 'Apply' })).toBeEnabled();
    expect(mockedUseListRequestsQuery).not.toHaveBeenCalledWith(
      expect.objectContaining({ status: 'QUOTING' }),
      expect.anything(),
    );

    await user.click(screen.getByRole('button', { name: 'Apply' }));

    expect(mockedUseListRequestsQuery).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'QUOTING' }),
      expect.anything(),
    );
    expect(
      within(screen.getByRole('button', { name: 'Filters' })).getByText('1'),
    ).toBeInTheDocument();
  });

  it('shows simplified people queue without viewMembers', async () => {
    const user = userEvent.setup();
    mockViewOnlyUser();

    renderWithProviders(
      <Routes>
        <Route path="/app/requests" element={<RequestsPage />} />
      </Routes>,
      {
        preloadedState: { auth: { activeCompanyId: COMPANY_ID } as never },
        route: '/app/requests',
      },
    );

    await openFilters(user);

    expect(screen.getByRole('button', { name: 'Mine' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'For me' })).toBeInTheDocument();
    expect(screen.queryByLabelText('Created by')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Assignee')).not.toBeInTheDocument();
  });

  it('shows member selects with viewMembers', async () => {
    const user = userEvent.setup();
    mockedUseGetMeQuery.mockReturnValue({
      data: {
        user: createTestUser({
          memberships: [
            createMembership({
              effectivePermissions: [
                'viewRequests',
                'manageRequests',
                'viewMembers',
              ],
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
        <Route path="/app/requests" element={<RequestsPage />} />
      </Routes>,
      {
        preloadedState: { auth: { activeCompanyId: COMPANY_ID } as never },
        route: '/app/requests',
      },
    );

    await openFilters(user);

    expect(screen.getByLabelText('Created by')).toBeInTheDocument();
    expect(screen.getByLabelText('Assignee')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Mine' })).not.toBeInTheDocument();
  });

  it('hides new request button without manageRequests', () => {
    mockViewOnlyUser();

    renderWithProviders(
      <Routes>
        <Route path="/app/requests" element={<RequestsPage />} />
      </Routes>,
      {
        preloadedState: { auth: { activeCompanyId: COMPANY_ID } as never },
        route: '/app/requests',
      },
    );

    expect(
      screen.queryByRole('link', { name: 'New request' }),
    ).not.toBeInTheDocument();
  });
});
