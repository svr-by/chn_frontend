import { describe, expect, it, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';

import { useGetMeQuery } from '@/api/endpoints/authApi';
import {
  useInviteMemberMutation,
  useListInvitationsQuery,
  useListMembersQuery,
  useRemoveMemberMutation,
  useRevokeInvitationMutation,
  useUpdateMemberRoleMutation,
} from '@/api/endpoints/membersApi';
import { TeamSettingsPage } from '@/features/settings/TeamSettingsPage';
import { COMPANY_ID, createTestUser } from '@/test/fixtures';
import { renderWithProviders } from '@/test/render';

vi.mock('@/api/endpoints/authApi', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/api/endpoints/authApi')>();
  return {
    ...actual,
    useGetMeQuery: vi.fn(),
  };
});

vi.mock('@/api/endpoints/membersApi', () => ({
  useListMembersQuery: vi.fn(),
  useListInvitationsQuery: vi.fn(),
  useInviteMemberMutation: vi.fn(),
  useRevokeInvitationMutation: vi.fn(),
  useRemoveMemberMutation: vi.fn(),
  useUpdateMemberRoleMutation: vi.fn(),
}));

const mockedUseGetMeQuery = vi.mocked(useGetMeQuery);
const mockedUseListMembersQuery = vi.mocked(useListMembersQuery);
const mockedUseListInvitationsQuery = vi.mocked(useListInvitationsQuery);
const mockedUseInviteMemberMutation = vi.mocked(useInviteMemberMutation);
const mockedUseRevokeInvitationMutation = vi.mocked(useRevokeInvitationMutation);
const mockedUseRemoveMemberMutation = vi.mocked(useRemoveMemberMutation);
const mockedUseUpdateMemberRoleMutation = vi.mocked(useUpdateMemberRoleMutation);

function mockMutationHook(mock: ReturnType<typeof vi.fn>) {
  return [mock, { isLoading: false, reset: vi.fn() }] as const;
}

describe('TeamSettingsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockedUseGetMeQuery.mockReturnValue({
      data: { user: createTestUser() },
      isLoading: false,
      isFetching: false,
      refetch: vi.fn(),
    } as ReturnType<typeof useGetMeQuery>);

    mockedUseListMembersQuery.mockReturnValue({
      data: {
        members: [
          {
            id: '00000000-0000-0000-0000-000000000040',
            role: 'OWNER',
            status: 'ACTIVE',
            user: {
              id: '00000000-0000-0000-0000-000000000001',
              email: 'owner@example.com',
              firstName: 'Owner',
              lastName: 'User',
            },
          },
        ],
        pagination: { total: 1, limit: 50, offset: 0 },
      },
      isLoading: false,
      isFetching: false,
      refetch: vi.fn(),
    } as ReturnType<typeof useListMembersQuery>);

    mockedUseListInvitationsQuery.mockReturnValue({
      data: {
        invitations: [],
        pagination: { total: 0, limit: 50, offset: 0 },
      },
      isLoading: false,
      isFetching: false,
      refetch: vi.fn(),
    } as ReturnType<typeof useListInvitationsQuery>);

    mockedUseInviteMemberMutation.mockReturnValue(
      mockMutationHook(vi.fn()) as ReturnType<typeof useInviteMemberMutation>,
    );
    mockedUseRevokeInvitationMutation.mockReturnValue(
      mockMutationHook(vi.fn()) as ReturnType<typeof useRevokeInvitationMutation>,
    );
    mockedUseRemoveMemberMutation.mockReturnValue(
      mockMutationHook(vi.fn()) as ReturnType<typeof useRemoveMemberMutation>,
    );
    mockedUseUpdateMemberRoleMutation.mockReturnValue(
      mockMutationHook(vi.fn()) as ReturnType<typeof useUpdateMemberRoleMutation>,
    );
  });

  it('renders nothing without active company', () => {
    const { container } = renderWithProviders(<TeamSettingsPage />, {
      preloadedState: {
        auth: { activeCompanyId: null, isBootstrapped: true },
      },
    });

    expect(container).toBeEmptyDOMElement();
  });

  it('renders team settings with members list', () => {
    renderWithProviders(<TeamSettingsPage />, {
      preloadedState: {
        auth: { activeCompanyId: COMPANY_ID, isBootstrapped: true },
      },
    });

    expect(screen.getByText('Team settings')).toBeInTheDocument();
    expect(screen.getByText('Active members')).toBeInTheDocument();
    expect(screen.getByText('Owner User')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Invite member' }),
    ).toBeInTheDocument();
  });
});
