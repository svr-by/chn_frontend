import { describe, expect, it, vi, beforeEach } from 'vitest';
import { Route, Routes } from 'react-router-dom';
import { screen } from '@testing-library/react';

import { useGetMeQuery } from '@/api/endpoints/authApi';
import { authStorage } from '@/lib/authStorage';
import { ProtectedRoute } from '@/routes/ProtectedRoute';
import { createMembership, createTestUser } from '@/test/fixtures';
import { renderWithProviders } from '@/test/render';

vi.mock('@/api/endpoints/authApi', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/api/endpoints/authApi')>();
  return {
    ...actual,
    useGetMeQuery: vi.fn(),
  };
});

vi.mock('@/lib/authStorage', () => ({
  authStorage: {
    getRefreshToken: vi.fn(),
    getAccessToken: vi.fn(),
    getActiveCompanyId: vi.fn(),
    setAccessToken: vi.fn(),
    setRefreshToken: vi.fn(),
    setActiveCompanyId: vi.fn(),
    clearAccessToken: vi.fn(),
    clearRefreshToken: vi.fn(),
    clearActiveCompanyId: vi.fn(),
    clearAll: vi.fn(),
  },
}));

const mockedUseGetMeQuery = vi.mocked(useGetMeQuery);
const mockedGetRefreshToken = vi.mocked(authStorage.getRefreshToken);

function renderProtectedRoute(
  options: {
    requireCompany?: boolean;
    allowSuspended?: boolean;
  } = {},
) {
  return renderWithProviders(
    <Routes>
      <Route
        element={
          <ProtectedRoute
            requireCompany={options.requireCompany}
            allowSuspended={options.allowSuspended}
          />
        }
      >
        <Route path="/app" element={<div>Protected content</div>} />
      </Route>
      <Route path="/login" element={<div>Login page</div>} />
      <Route path="/access-suspended" element={<div>Access suspended</div>} />
      <Route path="/onboarding" element={<div>Onboarding</div>} />
    </Routes>,
    {
      route: '/app',
      preloadedState: {
        auth: {
          activeCompanyId: null,
          isBootstrapped: true,
        },
      },
    },
  );
}

describe('ProtectedRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedGetRefreshToken.mockReturnValue('refresh-token');
    mockedUseGetMeQuery.mockReturnValue({
      data: { user: createTestUser() },
      isLoading: false,
      isFetching: false,
      refetch: vi.fn(),
    } as ReturnType<typeof useGetMeQuery>);
  });

  it('redirects to login when there is no refresh token', () => {
    mockedGetRefreshToken.mockReturnValue(null);

    renderProtectedRoute();

    expect(screen.getByText('Login page')).toBeInTheDocument();
  });

  it('renders child route for user with active membership', () => {
    renderProtectedRoute();

    expect(screen.getByText('Protected content')).toBeInTheDocument();
  });

  it('allows unverified email when user has active membership', () => {
    mockedUseGetMeQuery.mockReturnValue({
      data: { user: createTestUser({ emailVerified: false }) },
      isLoading: false,
      isFetching: false,
      refetch: vi.fn(),
    } as ReturnType<typeof useGetMeQuery>);

    renderProtectedRoute();

    expect(screen.getByText('Protected content')).toBeInTheDocument();
  });

  it('redirects suspended-only users to access-suspended', () => {
    mockedUseGetMeQuery.mockReturnValue({
      data: {
        user: createTestUser({
          memberships: [createMembership({ status: 'SUSPENDED' })],
        }),
      },
      isLoading: false,
      isFetching: false,
      refetch: vi.fn(),
    } as ReturnType<typeof useGetMeQuery>);

    renderProtectedRoute();

    expect(screen.getByText('Access suspended')).toBeInTheDocument();
  });

  it('redirects users without active membership to onboarding', () => {
    mockedUseGetMeQuery.mockReturnValue({
      data: { user: createTestUser({ memberships: [] }) },
      isLoading: false,
      isFetching: false,
      refetch: vi.fn(),
    } as ReturnType<typeof useGetMeQuery>);

    renderProtectedRoute();

    expect(screen.getByText('Onboarding')).toBeInTheDocument();
  });

  it('allows suspended users when allowSuspended is true', () => {
    mockedUseGetMeQuery.mockReturnValue({
      data: {
        user: createTestUser({
          memberships: [createMembership({ status: 'SUSPENDED' })],
        }),
      },
      isLoading: false,
      isFetching: false,
      refetch: vi.fn(),
    } as ReturnType<typeof useGetMeQuery>);

    renderProtectedRoute({ requireCompany: false, allowSuspended: true });

    expect(screen.getByText('Protected content')).toBeInTheDocument();
  });
});
