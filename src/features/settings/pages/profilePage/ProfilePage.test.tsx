import { describe, expect, it, vi, beforeEach } from 'vitest';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import {
  useGetMeQuery,
  useResendVerificationMutation,
  useUpdateMeMutation,
} from '@/api/endpoints/authApi';
import { useUpdateCompanyMutation } from '@/api/endpoints/companiesApi';
import { ProfilePage } from '@/features/settings/pages/profilePage/ProfilePage';
import { COMPANY_ID, createMembership, createTestUser } from '@/test/fixtures';
import { renderWithProviders } from '@/test/render';

vi.mock('@/api/endpoints/authApi', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('@/api/endpoints/authApi')>();
  return {
    ...actual,
    useGetMeQuery: vi.fn(),
    useUpdateMeMutation: vi.fn(),
    useResendVerificationMutation: vi.fn(),
  };
});

vi.mock('@/api/endpoints/companiesApi', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('@/api/endpoints/companiesApi')>();
  return {
    ...actual,
    useUpdateCompanyMutation: vi.fn(),
  };
});

const mockedUseGetMeQuery = vi.mocked(useGetMeQuery);
const mockedUseUpdateMeMutation = vi.mocked(useUpdateMeMutation);
const mockedUseResendVerificationMutation = vi.mocked(
  useResendVerificationMutation,
);
const mockedUseUpdateCompanyMutation = vi.mocked(useUpdateCompanyMutation);

function mockMutationHook(mock: ReturnType<typeof vi.fn>) {
  return [
    mock,
    { isLoading: false, reset: vi.fn(), error: undefined },
  ] as const;
}

function renderProfile(user = createTestUser()) {
  mockedUseGetMeQuery.mockReturnValue({
    data: { user },
    isLoading: false,
    isFetching: false,
    refetch: vi.fn(),
  } as ReturnType<typeof useGetMeQuery>);

  return renderWithProviders(<ProfilePage />, {
    preloadedState: {
      auth: { activeCompanyId: COMPANY_ID, isBootstrapped: true },
    },
  });
}

describe('ProfilePage', () => {
  const updateMe = vi.fn();
  const updateCompany = vi.fn();
  const resendVerification = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    updateMe.mockReturnValue({ unwrap: vi.fn().mockResolvedValue({}) });
    updateCompany.mockReturnValue({ unwrap: vi.fn().mockResolvedValue({}) });
    resendVerification.mockReturnValue({
      unwrap: vi.fn().mockResolvedValue({}),
    });
    mockedUseUpdateMeMutation.mockReturnValue(
      mockMutationHook(updateMe) as ReturnType<typeof useUpdateMeMutation>,
    );
    mockedUseUpdateCompanyMutation.mockReturnValue(
      mockMutationHook(updateCompany) as ReturnType<
        typeof useUpdateCompanyMutation
      >,
    );
    mockedUseResendVerificationMutation.mockReturnValue(
      mockMutationHook(resendVerification) as ReturnType<
        typeof useResendVerificationMutation
      >,
    );
  });

  it('shows a name edit button', () => {
    renderProfile();

    expect(
      screen.getByRole('button', { name: 'Edit name' }),
    ).toBeInTheDocument();
  });

  it('hides company edit buttons without manageCompany', () => {
    renderProfile();

    expect(
      screen.queryByRole('button', { name: 'Edit company name' }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Edit country' }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Edit tax ID' }),
    ).not.toBeInTheDocument();
  });

  it('shows unverified hint and resend action on the email row', async () => {
    const user = userEvent.setup();
    renderProfile(createTestUser({ emailVerified: false }));

    expect(screen.getByText('Email is not verified')).toBeInTheDocument();
    expect(screen.queryByText('Email verification')).not.toBeInTheDocument();

    await user.click(
      screen.getByRole('button', { name: 'Resend verification email' }),
    );

    expect(resendVerification).toHaveBeenCalled();
  });

  it('hides resend verification when email is verified', () => {
    renderProfile();

    expect(screen.queryByText('Email is not verified')).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Resend verification email' }),
    ).not.toBeInTheDocument();
  });

  it('saves a new company name when the user has manageCompany', async () => {
    const user = userEvent.setup();
    renderProfile(
      createTestUser({
        memberships: [
          createMembership({
            effectivePermissions: ['manageCompany'],
          }),
        ],
      }),
    );

    await user.click(
      screen.getByRole('button', { name: 'Edit company name' }),
    );

    const dialog = screen.getByRole('dialog');
    const nameField = within(dialog).getByLabelText('Company');
    await user.clear(nameField);
    await user.type(nameField, 'New Corp');
    await user.click(within(dialog).getByRole('button', { name: 'Save' }));

    expect(updateCompany).toHaveBeenCalledWith({
      companyId: COMPANY_ID,
      name: 'New Corp',
    });
  });
});
