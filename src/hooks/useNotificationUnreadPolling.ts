import { useGetUnreadNotificationCountQuery } from '@/api/endpoints/notificationsApi';
import { useAppSelector } from '@/hooks/useAppSelector';
import { usePermissions } from '@/hooks/usePermissions';

const POLLING_INTERVAL_MS = 60_000;

export function useNotificationUnreadPolling() {
  const companyId = useAppSelector((state) => state.auth.activeCompanyId);
  const { hasPermission } = usePermissions();
  const canView = hasPermission('viewNotifications');

  const query = useGetUnreadNotificationCountQuery(
    { companyId: companyId ?? '' },
    {
      skip: !companyId || !canView,
      pollingInterval: canView ? POLLING_INTERVAL_MS : 0,
      skipPollingIfUnfocused: true,
      refetchOnFocus: true,
      refetchOnReconnect: true,
    },
  );

  return {
    unreadCount: query.data?.count ?? 0,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    refetch: query.refetch,
  };
}
