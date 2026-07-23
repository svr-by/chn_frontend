import { describe, expect, it, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { Route, Routes } from 'react-router-dom';

import { useGetMeQuery } from '@/api/endpoints/authApi';
import { AuthLayout } from '@/layouts/AuthLayout';
import { authStorage } from '@/lib/authStorage';
import { createTestUser } from '@/test/fixtures';
import { renderWithProviders } from '@/test/render';

vi.mock('@/api/endpoints/authApi', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('@/api/endpoints/authApi')>();
  return {
    ...actual,
    useGetMeQuery: vi.fn(),
  };
});

vi.mock('@/lib/authStorage', () => ({
  authStorage: {
    getRefreshToken: vi.fn(() => null),
    getAccessToken: vi.fn(() => null),
    getActiveCompanyId: vi.fn(() => null),
    setActiveCompanyId: vi.fn(),
    clearActiveCompanyId: vi.fn(),
    setAccessToken: vi.fn(),
    setRefreshToken: vi.fn(),
    clearAll: vi.fn(),
  },
}));

const mockedUseGetMeQuery = vi.mocked(useGetMeQuery);
const mockedGetRefreshToken = vi.mocked(authStorage.getRefreshToken);

function renderAuthLayout(route: string, layout: ReactNode) {
  return renderWithProviders(
    <Routes>
      <Route element={layout}>
        <Route path={route} element={<div>Auth child content</div>} />
      </Route>
    </Routes>,
    { route },
  );
}

describe('AuthLayout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedGetRefreshToken.mockReturnValue(null);
    mockedUseGetMeQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      isFetching: false,
      refetch: vi.fn(),
    } as ReturnType<typeof useGetMeQuery>);
  });

  it('renders card brand, tagline, locale/theme controls, and outlet for guests', () => {
    renderAuthLayout('/login', <AuthLayout />);

    const logo = screen.getByRole('img', { name: 'CHN' });
    expect(logo).toHaveAttribute('src', '/assets/logo.png');
    expect(
      screen.getByText('One board for your entire supply chain'),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Language' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Theme' })).toBeInTheDocument();
    expect(screen.getByText('Auth child content')).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Log out' }),
    ).not.toBeInTheDocument();
  });

  it('renders plain variant without brand card chrome', () => {
    renderAuthLayout('/onboarding', <AuthLayout variant="plain" />);

    expect(screen.queryByRole('img', { name: 'CHN' })).not.toBeInTheDocument();
    expect(
      screen.queryByText('One board for your entire supply chain'),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Language' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Theme' })).toBeInTheDocument();
    expect(screen.getByText('Auth child content')).toBeInTheDocument();
  });

  it('shows authenticated top bar with logout when a session exists', () => {
    mockedGetRefreshToken.mockReturnValue('refresh-token');
    mockedUseGetMeQuery.mockReturnValue({
      data: {
        user: createTestUser({ email: 'owner@example.com' }),
      },
      isLoading: false,
      isFetching: false,
      refetch: vi.fn(),
    } as ReturnType<typeof useGetMeQuery>);

    renderAuthLayout('/onboarding', <AuthLayout variant="plain" />);

    const shortLogo = screen.getByRole('img', { name: 'CHN' });
    expect(shortLogo).toHaveAttribute('src', '/assets/logo_short.png');
    expect(screen.getByText('owner@example.com')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Log out' })).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Language' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Theme' })).toBeInTheDocument();
    expect(screen.getByText('Auth child content')).toBeInTheDocument();
  });
});
