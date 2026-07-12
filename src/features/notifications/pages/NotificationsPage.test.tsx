import { describe, expect, it, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';

import { useGetMeQuery } from '@/api/endpoints/authApi';
import {
  useLazyListNotificationsQuery,
  useMarkAllNotificationsReadMutation,
} from '@/api/endpoints/notificationsApi';
import { NotificationsPage } from '@/features/notifications/pages/NotificationsPage';
import {
  COMPANY_ID,
  createMembership,
  createNotification,
  createTestUser,
} from '@/test/fixtures';
import { renderWithProviders } from '@/test/render';

vi.mock('@/api/endpoints/authApi', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/api/endpoints/authApi')>();
  return {
    ...actual,
    useGetMeQuery: vi.fn(),
  };
});

vi.mock('@/api/endpoints/notificationsApi', () => ({
  useLazyListNotificationsQuery: vi.fn(),
  useMarkNotificationReadMutation: vi.fn(() => [
    vi.fn(),
    { isLoading: false, reset: vi.fn() },
  ]),
  useMarkAllNotificationsReadMutation: vi.fn(),
}));

const mockedUseGetMeQuery = vi.mocked(useGetMeQuery);
const mockedUseLazyListNotificationsQuery = vi.mocked(
  useLazyListNotificationsQuery,
);
const mockedUseMarkAllNotificationsReadMutation = vi.mocked(
  useMarkAllNotificationsReadMutation,
);

describe('NotificationsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
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
    mockedUseLazyListNotificationsQuery.mockReturnValue([
      vi.fn().mockReturnValue({
        unwrap: vi.fn().mockResolvedValue({
          notifications: [createNotification()],
          nextCursor: null,
        }),
      }),
      { isLoading: false, reset: vi.fn() },
      { lastArg: undefined },
    ] as unknown as ReturnType<typeof useLazyListNotificationsQuery>);
    mockedUseMarkAllNotificationsReadMutation.mockReturnValue([
      vi.fn().mockReturnValue({ unwrap: vi.fn().mockResolvedValue({}) }),
      { isLoading: false, reset: vi.fn() },
    ] as ReturnType<typeof useMarkAllNotificationsReadMutation>);
  });

  it('renders notifications and mark all read action', async () => {
    renderWithProviders(<NotificationsPage />, {
      preloadedState: { auth: { activeCompanyId: COMPANY_ID } as never },
    });

    expect(await screen.findByText('New comment on invoice')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Mark all read' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Unread only' })).toBeInTheDocument();
  });
});
