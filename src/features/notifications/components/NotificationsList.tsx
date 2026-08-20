import { useCallback } from 'react';
import {
  Box,
  Button,
  CircularProgress,
  List,
  ListItemButton,
  ListItemText,
  Stack,
  Typography,
} from '@mui/material';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { useTranslation } from 'react-i18next';

import type { Notification } from '@/api/generated/models/notification';
import { GetCompaniesCompanyIdNotificationsUnreadOnly } from '@/api/generated/models/getCompaniesCompanyIdNotificationsUnreadOnly';
import { useLazyListNotificationsQuery } from '@/api/endpoints/notificationsApi';
import { ApiErrorAlert } from '@/components/feedback/apiErrorAlert/ApiErrorAlert';
import { useCursorList } from '@/hooks/useCursorList';

dayjs.extend(relativeTime);

const PAGE_SIZE = 20;

interface NotificationsListProps {
  companyId: string;
  unreadOnly?: boolean;
  onNotificationClick?: (notification: Notification) => void;
}

export function NotificationsList({
  companyId,
  unreadOnly = false,
  onNotificationClick,
}: NotificationsListProps) {
  const { t } = useTranslation('notifications');
  const [trigger] = useLazyListNotificationsQuery();

  const fetchPage = useCallback(
    async (cursor?: string) => {
      const result = await trigger({
        companyId,
        limit: PAGE_SIZE,
        cursor,
        unreadOnly: unreadOnly
          ? GetCompaniesCompanyIdNotificationsUnreadOnly.true
          : undefined,
      }).unwrap();
      return {
        items: result.notifications,
        nextCursor: result.nextCursor ?? null,
      };
    },
    [companyId, trigger, unreadOnly],
  );

  const resetKey = `${companyId}-${unreadOnly ? 'unread' : 'all'}`;
  const { items, hasMore, isLoading, isLoadingMore, error, loadMore } =
    useCursorList({
      enabled: Boolean(companyId),
      fetchPage,
      resetKey,
    });

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" py={4}>
        <CircularProgress size={32} />
      </Box>
    );
  }

  if (error) {
    return <ApiErrorAlert error={error as never} />;
  }

  if (items.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
        {t('empty')}
      </Typography>
    );
  }

  return (
    <Stack spacing={1}>
      <List disablePadding>
        {items.map((notification) => {
          const isUnread = !notification.readAt;

          return (
            <ListItemButton
              key={notification.id}
              alignItems="flex-start"
              onClick={() => onNotificationClick?.(notification)}
              sx={{
                px: 0,
                py: 1.5,
                borderBottom: 1,
                borderColor: 'divider',
              }}
            >
              <ListItemText
                slotProps={{
                  primary: { component: 'div' },
                  secondary: { component: 'div' },
                }}
                primary={
                  <Stack direction="row" spacing={1} alignItems="center">
                    {isUnread ? (
                      <Box
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          bgcolor: 'primary.main',
                          flexShrink: 0,
                        }}
                      />
                    ) : null}
                    <Typography
                      variant="subtitle2"
                      component="span"
                      fontWeight={isUnread ? 600 : 400}
                    >
                      {notification.title}
                    </Typography>
                  </Stack>
                }
                secondary={
                  <Stack spacing={0.5} sx={{ mt: 0.5 }}>
                    {notification.body ? (
                      <Typography
                        variant="body2"
                        component="span"
                        color="text.secondary"
                        display="block"
                      >
                        {notification.body}
                      </Typography>
                    ) : null}
                    <Typography
                      variant="caption"
                      component="span"
                      color="text.secondary"
                      display="block"
                    >
                      {dayjs(notification.createdAt).fromNow()}
                    </Typography>
                  </Stack>
                }
              />
            </ListItemButton>
          );
        })}
      </List>

      {hasMore ? (
        <Button
          variant="outlined"
          onClick={() => void loadMore()}
          disabled={isLoadingMore}
          fullWidth
        >
          {isLoadingMore ? t('loadingMore') : t('loadMore')}
        </Button>
      ) : null}
    </Stack>
  );
}
