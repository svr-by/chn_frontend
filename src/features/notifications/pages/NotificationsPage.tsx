import { useState } from 'react';
import {
  Button,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';

import type { Notification } from '@/api/generated/models/notification';
import {
  useMarkAllNotificationsReadMutation,
  useMarkNotificationReadMutation,
} from '@/api/endpoints/notificationsApi';
import { PermissionGate } from '@/components/PermissionGate';
import { NotificationsList } from '@/features/notifications/components/NotificationsList';
import { useAppSelector } from '@/hooks/useAppSelector';
import { resolveNotificationPath } from '@/lib/notificationRoutes';

export function NotificationsPage() {
  const { t } = useTranslation('notifications');
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const companyId = useAppSelector((state) => state.auth.activeCompanyId);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const [markRead] = useMarkNotificationReadMutation();
  const [markAllRead, markAllState] = useMarkAllNotificationsReadMutation();

  async function handleMarkAllRead() {
    if (!companyId) {
      return;
    }

    try {
      await markAllRead({ companyId }).unwrap();
      enqueueSnackbar(t('markAllReadSuccess'), { variant: 'success' });
    } catch {
      enqueueSnackbar(t('markAllReadError'), { variant: 'error' });
    }
  }

  async function handleNotificationClick(notification: Notification) {
    if (!companyId) {
      return;
    }

    if (!notification.readAt) {
      try {
        await markRead({
          companyId,
          notificationId: notification.id,
        }).unwrap();
      } catch {
        enqueueSnackbar(t('markReadError'), { variant: 'error' });
      }
    }

    const path = resolveNotificationPath(notification);

    if (path) {
      navigate(path);
    }
  }

  if (!companyId) {
    return null;
  }

  return (
    <PermissionGate
      permission="viewNotifications"
      fallback={
        <Typography variant="body1" color="text.secondary">
          {t('noPermission')}
        </Typography>
      }
    >
      <Stack spacing={3}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'stretch', sm: 'center' }}
          spacing={2}
        >
          <Typography variant="h5" component="h1">
            {t('title')}
          </Typography>
          <Button
            variant="outlined"
            onClick={() => void handleMarkAllRead()}
            disabled={markAllState.isLoading}
          >
            {t('markAllRead')}
          </Button>
        </Stack>

        <ToggleButtonGroup
          exclusive
          size="small"
          value={filter}
          onChange={(_event, value: 'all' | 'unread' | null) => {
            if (value) {
              setFilter(value);
            }
          }}
        >
          <ToggleButton value="all">{t('all')}</ToggleButton>
          <ToggleButton value="unread">{t('unreadOnly')}</ToggleButton>
        </ToggleButtonGroup>

        <NotificationsList
          companyId={companyId}
          unreadOnly={filter === 'unread'}
          onNotificationClick={(notification) =>
            void handleNotificationClick(notification)
          }
        />
      </Stack>
    </PermissionGate>
  );
}
