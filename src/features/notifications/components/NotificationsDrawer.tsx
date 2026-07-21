import { useState } from 'react';
import {
  Box,
  Button,
  Divider,
  Drawer,
  Link,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';

import type { Notification } from '@/api/generated/models/notification';
import {
  useMarkAllNotificationsReadMutation,
  useMarkNotificationReadMutation,
} from '@/api/endpoints/notificationsApi';
import { NotificationsList } from '@/features/notifications/components/NotificationsList';
import { useAppSelector } from '@/hooks/useAppSelector';
import { resolveNotificationPath } from '@/lib/notificationRoutes';

interface NotificationsDrawerProps {
  open: boolean;
  onClose: () => void;
}

export function NotificationsDrawer({ open, onClose }: NotificationsDrawerProps) {
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

    onClose();

    if (path) {
      navigate(path);
    }
  }

  if (!companyId) {
    return null;
  }

  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <Box sx={{ width: { xs: '100vw', sm: 400 }, p: 2 }}>
        <Stack spacing={2}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography variant="h6">{t('title')}</Typography>
            <Button
              size="small"
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

          <Divider />

          <NotificationsList
            companyId={companyId}
            unreadOnly={filter === 'unread'}
            onNotificationClick={(notification) =>
              void handleNotificationClick(notification)
            }
          />

          <Link component={RouterLink} to="/app/notifications" onClick={onClose}>
            {t('viewAll')}
          </Link>
        </Stack>
      </Box>
    </Drawer>
  );
}
