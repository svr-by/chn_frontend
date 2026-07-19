import { describe, expect, it, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router-dom';

import { useGetMeQuery } from '@/api/endpoints/authApi';
import {
  useListMembersQuery,
  useUpdateMemberPermissionsMutation,
  useUpdateMemberRoleMutation,
  useUpdateMemberStatusMutation,
} from '@/api/endpoints/membersApi';
import { MemberAccessPage } from '@/features/settings/pages/MemberAccessPage';
import { COMPANY_ID, createMembership, createTestUser } from '@/test/fixtures';
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
  useUpdateMemberRoleMutation: vi.fn(),
  useUpdateMemberPermissionsMutation: vi.fn(),
  useUpdateMemberStatusMutation: vi.fn(),
}));

const mockedUseGetMeQuery = vi.mocked(useGetMeQuery);
const mockedUseListMembersQuery = vi.mocked(useListMembersQuery);
const mockedUseUpdateMemberRoleMutation = vi.mocked(useUpdateMemberRoleMutation);
const mockedUseUpdateMemberPermissionsMutation = vi.mocked(
  useUpdateMemberPermissionsMutation,
);
const mockedUseUpdateMemberStatusMutation = vi.mocked(
  useUpdateMemberStatusMutation,
);

const MEMBER_ID = '00000000-0000-0000-0000-000000000041';

function mockMutationHook(mock: ReturnType<typeof vi.fn>) {
  return [mock, { isLoading: false, reset: vi.fn(), error: undefined }] as const;
}

function renderAccessPage() {
  return renderWithProviders(
    <Routes>
      <Route path="/app/settings/team/:memberId" element={<MemberAccessPage />} />
    </Routes>,
    {
      route: `/app/settings/team/${MEMBER_ID}`,
      preloadedState: {
        auth: { activeCompanyId: COMPANY_ID, isBootstrapped: true },
      },
    },
  );
}

describe('MemberAccessPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockedUseGetMeQuery.mockReturnValue({
      data: {
        user: createTestUser({
          memberships: [
            createMembership({
              effectivePermissions: [
                'manageMembers',
                'manageMemberPermissions',
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

    mockedUseListMembersQuery.mockReturnValue({
      data: {
        members: [
          {
            id: MEMBER_ID,
            role: 'VIEWER',
            status: 'ACTIVE',
            permissions: null,
            effectivePermissions: ['viewMembers'],
            invitedAt: null,
            joinedAt: '2026-01-02T00:00:00.000Z',
            user: {
              id: '00000000-0000-0000-0000-000000000002',
              email: 'viewer@example.com',
              firstName: 'Viewer',
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

    mockedUseUpdateMemberRoleMutation.mockReturnValue(
      mockMutationHook(vi.fn().mockResolvedValue({})) as ReturnType<
        typeof useUpdateMemberRoleMutation
      >,
    );
    mockedUseUpdateMemberPermissionsMutation.mockReturnValue(
      mockMutationHook(vi.fn().mockResolvedValue({})) as ReturnType<
        typeof useUpdateMemberPermissionsMutation
      >,
    );
    mockedUseUpdateMemberStatusMutation.mockReturnValue(
      mockMutationHook(vi.fn().mockResolvedValue({})) as ReturnType<
        typeof useUpdateMemberStatusMutation
      >,
    );
  });

  it('renders member access editor', () => {
    renderAccessPage();

    expect(screen.getByText('Viewer User')).toBeInTheDocument();
    expect(screen.getByText('viewer@example.com')).toBeInTheDocument();
    expect(screen.getByText('Permissions')).toBeInTheDocument();
    expect(screen.getByLabelText('Active')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled();
  });

  it('saves role change', async () => {
    const user = userEvent.setup();
    const updateRole = vi.fn().mockReturnValue({
      unwrap: () => Promise.resolve({}),
    });
    mockedUseUpdateMemberRoleMutation.mockReturnValue(
      mockMutationHook(updateRole) as ReturnType<typeof useUpdateMemberRoleMutation>,
    );

    renderAccessPage();

    await user.click(screen.getByRole('combobox', { name: 'Role' }));
    await user.click(await screen.findByRole('option', { name: 'Admin' }));
    await user.click(screen.getByRole('button', { name: 'Save' }));

    expect(updateRole).toHaveBeenCalledWith({
      companyId: COMPANY_ID,
      memberId: MEMBER_ID,
      body: { role: 'ADMIN' },
    });
  });
});
