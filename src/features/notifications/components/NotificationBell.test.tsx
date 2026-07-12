import { describe, expect, it, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';

import { useGetMeQuery } from '@/api/endpoints/authApi';
import { useNotificationUnreadPolling } from '@/hooks/useNotificationUnreadPolling';
import { NotificationBell } from '@/features/notifications/components/NotificationBell';
import { COMPANY_ID, createMembership, createTestUser } from '@/test/fixtures';
import { renderWithProviders } from '@/test/render';

vi.mock('@/api/endpoints/authApi', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/api/endpoints/authApi')>();
  return {
    ...actual,
    useGetMeQuery: vi.fn(),
  };
});

vi.mock('@/hooks/useNotificationUnreadPolling', () => ({
  useNotificationUnreadPolling: vi.fn(),
}));

vi.mock('@/features/notifications/components/NotificationsDrawer', () => ({
  NotificationsDrawer: () => null,
}));

const mockedUseGetMeQuery = vi.mocked(useGetMeQuery);
const mockedUseNotificationUnreadPolling = vi.mocked(useNotificationUnreadPolling);

describe('NotificationBell', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedUseNotificationUnreadPolling.mockReturnValue({
      unreadCount: 3,
      isLoading: false,
      isFetching: false,
      refetch: vi.fn(),
    });
  });

  it('shows badge when user has viewNotifications permission', () => {
    mockedUseGetMeQuery.mockReturnValue({
      data: {
        user: createTestUser({
          memberships: [
            createMembership({
              effectivePermissions: ['viewNotifications'],
            }),
          ],
        }),
      },
      isLoading: false,
      isFetching: false,
      refetch: vi.fn(),
    } as ReturnType<typeof useGetMeQuery>);

    renderWithProviders(<NotificationBell />, {
      preloadedState: { auth: { activeCompanyId: COMPANY_ID } as never },
    });

    expect(screen.getByLabelText('Notifications')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('is hidden without viewNotifications permission', () => {
    mockedUseGetMeQuery.mockReturnValue({
      data: {
        user: createTestUser({
          memberships: [createMembership({ effectivePermissions: ['viewInvoices'] })],
        }),
      },
      isLoading: false,
      isFetching: false,
      refetch: vi.fn(),
    } as ReturnType<typeof useGetMeQuery>);

    renderWithProviders(<NotificationBell />, {
      preloadedState: { auth: { activeCompanyId: COMPANY_ID } as never },
    });

    expect(screen.queryByLabelText('Notifications')).not.toBeInTheDocument();
  });
});
