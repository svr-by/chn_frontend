import { describe, expect, it, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { useGetMeQuery } from '@/api/endpoints/authApi';
import {
  useAcceptPartnerMutation,
  useCancelPartnerInvitationMutation,
  useInvitePartnerMutation,
  useListPartnerInvitationsQuery,
  useListPartnersQuery,
  useRejectPartnerMutation,
  useUnlinkPartnerMutation,
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
  const actual =
    await importOriginal<typeof import('@/api/endpoints/authApi')>();
  return {
    ...actual,
    useGetMeQuery: vi.fn(),
  };
});

vi.mock('@/api/endpoints/partnersApi', () => ({
  useListPartnerInvitationsQuery: vi.fn(),
  useInvitePartnerMutation: vi.fn(),
  useCancelPartnerInvitationMutation: vi.fn(),
  useUnlinkPartnerMutation: vi.fn(),
  useAcceptPartnerMutation: vi.fn(),
  useRejectPartnerMutation: vi.fn(),
  useListPartnersQuery: vi.fn(),
}));

const mockedUseGetMeQuery = vi.mocked(useGetMeQuery);
const mockedUseListPartnersQuery = vi.mocked(useListPartnersQuery);
const mockedUseListPartnerInvitationsQuery = vi.mocked(
  useListPartnerInvitationsQuery,
);
const mockedUseInvitePartnerMutation = vi.mocked(useInvitePartnerMutation);
const mockedUseAcceptPartnerMutation = vi.mocked(useAcceptPartnerMutation);
const mockedUseRejectPartnerMutation = vi.mocked(useRejectPartnerMutation);
const mockedUseCancelPartnerInvitationMutation = vi.mocked(
  useCancelPartnerInvitationMutation,
);
const mockedUseUnlinkPartnerMutation = vi.mocked(useUnlinkPartnerMutation);

function mockMutationHook(mock: ReturnType<typeof vi.fn>) {
  return [mock, { isLoading: false, reset: vi.fn() }] as const;
}

function mockPartnerQueries() {
  mockedUseListPartnersQuery.mockReturnValue({
    data: {
      partners: [
        createTradingPartner({
          status: 'ACTIVE',
          direction: 'outbound',
          acceptedAt: '2026-01-02T00:00:00.000Z',
          company: createPartnerCompany({ name: 'Active Corp' }),
        }),
      ],
    },
    isLoading: false,
    isFetching: false,
    error: undefined,
    refetch: vi.fn(),
  } as ReturnType<typeof useListPartnersQuery>);

  mockedUseListPartnerInvitationsQuery.mockReturnValue({
    data: {
      partners: [
        createTradingPartner({
          direction: 'inbound',
          company: createPartnerCompany({ name: 'Inbound Corp' }),
        }),
        createTradingPartner({
          id: '00000000-0000-0000-0000-000000000032',
          direction: 'outbound',
          company: createPartnerCompany({ name: 'Outbound Corp' }),
        }),
      ],
    },
    isLoading: false,
    isFetching: false,
    error: undefined,
    refetch: vi.fn(),
  } as ReturnType<typeof useListPartnerInvitationsQuery>);
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
    mockedUseCancelPartnerInvitationMutation.mockReturnValue(
      mockMutationHook(vi.fn()) as ReturnType<
        typeof useCancelPartnerInvitationMutation
      >,
    );
    mockedUseUnlinkPartnerMutation.mockReturnValue(
      mockMutationHook(vi.fn()) as ReturnType<typeof useUnlinkPartnerMutation>,
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

  it('renders active partners on the partners tab', () => {
    renderWithProviders(<PartnersPage />, {
      preloadedState: {
        auth: { activeCompanyId: COMPANY_ID, isBootstrapped: true },
      },
    });

    expect(
      screen.getByRole('heading', { name: 'Partners' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Active Corp')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'End partnership' }),
    ).toBeInTheDocument();
    expect(screen.queryByText('Inbound Corp')).not.toBeInTheDocument();
  });

  it('hides unlink without managePartners permission', () => {
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

    expect(screen.getByText('Active Corp')).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'End partnership' }),
    ).not.toBeInTheDocument();
  });

  it('renders invitations with accept and reject actions', async () => {
    const user = userEvent.setup();

    renderWithProviders(<PartnersPage />, {
      preloadedState: {
        auth: { activeCompanyId: COMPANY_ID, isBootstrapped: true },
      },
    });

    await user.click(screen.getByRole('tab', { name: /Invitations/ }));

    expect(screen.getByText('Inbound Corp')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Accept' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Reject' })).toBeInTheDocument();
  });

  it('hides accept and reject without managePartners permission', async () => {
    const user = userEvent.setup();

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

    await user.click(screen.getByRole('tab', { name: /Invitations/ }));

    expect(screen.getByText('Inbound Corp')).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Accept' }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Reject' }),
    ).not.toBeInTheDocument();
  });

  it('shows outbound invitations with cancel action', async () => {
    const user = userEvent.setup();

    renderWithProviders(<PartnersPage />, {
      preloadedState: {
        auth: { activeCompanyId: COMPANY_ID, isBootstrapped: true },
      },
    });

    await user.click(screen.getByRole('tab', { name: /Invitations/ }));

    expect(screen.getByText('Outbound Corp')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Cancel invitation' }),
    ).toBeInTheDocument();
  });
});
