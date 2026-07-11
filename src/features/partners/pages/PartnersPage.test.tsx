import { describe, expect, it, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { useGetMeQuery } from '@/api/endpoints/authApi';
import {
  useAcceptPartnerMutation,
  useInvitePartnerMutation,
  useListInboundPartnersQuery,
  useListOutboundPartnersQuery,
  useRejectPartnerMutation,
  useSearchPartnerDirectoryQuery,
} from '@/api/endpoints/partnersApi';
import { PartnersPage } from '@/features/partners/pages/PartnersPage';
import {
  COMPANY_ID,
  createMembership,
  createPartnerCompany,
  createTestUser,
  createTradingPartner,
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
  useListInboundPartnersQuery: vi.fn(),
  useListOutboundPartnersQuery: vi.fn(),
  useSearchPartnerDirectoryQuery: vi.fn(),
  useInvitePartnerMutation: vi.fn(),
  useAcceptPartnerMutation: vi.fn(),
  useRejectPartnerMutation: vi.fn(),
  useListPartnersQuery: vi.fn(),
}));

const mockedUseGetMeQuery = vi.mocked(useGetMeQuery);
const mockedUseListInboundPartnersQuery = vi.mocked(useListInboundPartnersQuery);
const mockedUseListOutboundPartnersQuery = vi.mocked(useListOutboundPartnersQuery);
const mockedUseSearchPartnerDirectoryQuery = vi.mocked(
  useSearchPartnerDirectoryQuery,
);
const mockedUseInvitePartnerMutation = vi.mocked(useInvitePartnerMutation);
const mockedUseAcceptPartnerMutation = vi.mocked(useAcceptPartnerMutation);
const mockedUseRejectPartnerMutation = vi.mocked(useRejectPartnerMutation);

function mockMutationHook(mock: ReturnType<typeof vi.fn>) {
  return [mock, { isLoading: false, reset: vi.fn() }] as const;
}

function mockPartnerQueries() {
  mockedUseListInboundPartnersQuery.mockReturnValue({
    data: { partners: [createTradingPartner()] },
    isLoading: false,
    isFetching: false,
    refetch: vi.fn(),
  } as ReturnType<typeof useListInboundPartnersQuery>);

  mockedUseListOutboundPartnersQuery.mockReturnValue({
    data: {
      partners: [
        createTradingPartner({
          direction: 'outbound',
          company: createPartnerCompany({ name: 'Outbound Corp' }),
        }),
      ],
    },
    isLoading: false,
    isFetching: false,
    refetch: vi.fn(),
  } as ReturnType<typeof useListOutboundPartnersQuery>);

  mockedUseSearchPartnerDirectoryQuery.mockReturnValue({
    data: { companies: [] },
    isLoading: false,
    isFetching: false,
    refetch: vi.fn(),
  } as ReturnType<typeof useSearchPartnerDirectoryQuery>);
}

describe('PartnersPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockedUseGetMeQuery.mockReturnValue({
      data: {
        user: createTestUser({
          memberships: [
            createMembership({
              effectivePermissions: [
                'viewPartners',
                'managePartners',
                'viewMembers',
                'manageMembers',
              ],
            }),
          ],
        }),
      },
      isLoading: false,
      isFetching: false,
      refetch: vi.fn(),
    } as ReturnType<typeof useGetMeQuery>);

    mockPartnerQueries();

    mockedUseInvitePartnerMutation.mockReturnValue(
      mockMutationHook(vi.fn()) as ReturnType<typeof useInvitePartnerMutation>,
    );
    mockedUseAcceptPartnerMutation.mockReturnValue(
      mockMutationHook(vi.fn()) as ReturnType<typeof useAcceptPartnerMutation>,
    );
    mockedUseRejectPartnerMutation.mockReturnValue(
      mockMutationHook(vi.fn()) as ReturnType<typeof useRejectPartnerMutation>,
    );
  });

  it('renders nothing without active company', () => {
    const { container } = renderWithProviders(<PartnersPage />, {
      preloadedState: {
        auth: { activeCompanyId: null, isBootstrapped: true },
      },
    });

    expect(container).toBeEmptyDOMElement();
  });

  it('renders inbound partners with accept and reject actions', () => {
    renderWithProviders(<PartnersPage />, {
      preloadedState: {
        auth: { activeCompanyId: COMPANY_ID, isBootstrapped: true },
      },
    });

    expect(screen.getByText('Partners')).toBeInTheDocument();
    expect(screen.getByText('Partner Corp')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Accept' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Reject' })).toBeInTheDocument();
  });

  it('hides accept and reject without managePartners permission', () => {
    mockedUseGetMeQuery.mockReturnValue({
      data: {
        user: createTestUser({
          memberships: [
            createMembership({
              effectivePermissions: ['viewPartners'],
            }),
          ],
        }),
      },
      isLoading: false,
      isFetching: false,
      refetch: vi.fn(),
    } as ReturnType<typeof useGetMeQuery>);

    renderWithProviders(<PartnersPage />, {
      preloadedState: {
        auth: { activeCompanyId: COMPANY_ID, isBootstrapped: true },
      },
    });

    expect(screen.getByText('Partner Corp')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Accept' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Reject' })).not.toBeInTheDocument();
  });

  it('shows outbound partners on outbound tab', async () => {
    const user = userEvent.setup();

    renderWithProviders(<PartnersPage />, {
      preloadedState: {
        auth: { activeCompanyId: COMPANY_ID, isBootstrapped: true },
      },
    });

    await user.click(screen.getByRole('tab', { name: 'Outbound' }));

    expect(screen.getByText('Outbound Corp')).toBeInTheDocument();
  });

  it('does not search directory until form submit', async () => {
    const user = userEvent.setup();

    renderWithProviders(<PartnersPage />, {
      preloadedState: {
        auth: { activeCompanyId: COMPANY_ID, isBootstrapped: true },
      },
    });

    await user.click(screen.getByRole('tab', { name: 'Directory' }));

    expect(mockedUseSearchPartnerDirectoryQuery).toHaveBeenCalledWith(
      expect.objectContaining({ companyId: COMPANY_ID }),
      expect.objectContaining({ skip: true }),
    );

    const searchInput = screen.getByLabelText('Company name');
    await user.type(searchInput, 'Acme');
    await user.click(screen.getByRole('button', { name: 'Search' }));

    await waitFor(() => {
      expect(mockedUseSearchPartnerDirectoryQuery).toHaveBeenCalledWith(
        expect.objectContaining({ companyId: COMPANY_ID, q: 'Acme' }),
        expect.objectContaining({ skip: false }),
      );
    });
  });
});
