import { describe, expect, it, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router-dom';

import { useGetMeQuery } from '@/api/endpoints/authApi';
import { AppLayout } from './AppLayout';
import { createMembership, createTestUser, COMPANY_ID } from '@/test/fixtures';
import { renderWithProviders } from '@/test/render';
import { AppThemeProvider } from '@/app/AppThemeProvider';

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
    getRefreshToken: vi.fn(() => 'refresh-token'),
    getAccessToken: vi.fn(() => 'access-token'),
    getActiveCompanyId: vi.fn(() => '00000000-0000-0000-0000-000000000010'),
    setActiveCompanyId: vi.fn(),
    clearActiveCompanyId: vi.fn(),
    setAccessToken: vi.fn(),
    setRefreshToken: vi.fn(),
    clearAll: vi.fn(),
  },
}));

vi.mock('@/features/notifications/components/NotificationBell', () => ({
  NotificationBell: () => <div data-testid="notification-bell" />,
}));

const mockedUseGetMeQuery = vi.mocked(useGetMeQuery);

describe('AppLayout', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockedUseGetMeQuery.mockReturnValue({
      data: {
        user: createTestUser({
          memberships: [
            createMembership({
              effectivePermissions: ['viewRequests', 'viewNotifications'],
            }),
            createMembership({
              id: '00000000-0000-0000-0000-000000000021',
              company: {
                id: '00000000-0000-0000-0000-000000000011',
                name: 'Beta LLC',
                taxId: null,
                country: null,
                isActive: true,
              },
              effectivePermissions: ['viewRequests'],
            }),
          ],
        }),
      },
      isLoading: false,
      isFetching: false,
      refetch: vi.fn(),
    } as ReturnType<typeof useGetMeQuery>);
  });

  it('renders language, theme, and company switcher controls', () => {
    renderWithProviders(
      <AppThemeProvider>
        <Routes>
          <Route path="/app" element={<AppLayout />}>
            <Route index element={<div>Home content</div>} />
          </Route>
        </Routes>
      </AppThemeProvider>,
      {
        route: '/app',
        preloadedState: {
          auth: {
            activeCompanyId: COMPANY_ID,
            isBootstrapped: true,
          },
        },
      },
    );

    expect(
      screen.getByRole('button', { name: 'Language' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Theme' })).toBeInTheDocument();
    expect(screen.getAllByLabelText('Company').length).toBeGreaterThan(0);
    expect(screen.getByTestId('notification-bell')).toBeInTheDocument();
    expect(screen.getByText('Home content')).toBeInTheDocument();
  });

  it('navigates to help from the account menu', async () => {
    const user = userEvent.setup();

    renderWithProviders(
      <AppThemeProvider>
        <Routes>
          <Route path="/app" element={<AppLayout />}>
            <Route index element={<div>Home content</div>} />
            <Route path="help" element={<div>Help content</div>} />
          </Route>
        </Routes>
      </AppThemeProvider>,
      {
        route: '/app',
        preloadedState: {
          auth: {
            activeCompanyId: COMPANY_ID,
            isBootstrapped: true,
          },
        },
      },
    );

    await user.click(screen.getByRole('button', { name: 'Account menu' }));
    await user.click(screen.getByRole('menuitem', { name: 'Help' }));

    expect(screen.getByText('Help content')).toBeInTheDocument();
  });
});
