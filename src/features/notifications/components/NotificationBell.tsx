import { useState } from 'react';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import { Badge, IconButton } from '@mui/material';
import { useTranslation } from 'react-i18next';

import { PermissionGate } from '@/components/auth/permissionGate/PermissionGate';
import { NotificationsDrawer } from '@/features/notifications/components/NotificationsDrawer';
import { useNotificationUnreadPolling } from '@/hooks/useNotificationUnreadPolling';

export function NotificationBell() {
  const { t } = useTranslation('common');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { unreadCount } = useNotificationUnreadPolling();

  const badgeContent = unreadCount > 99 ? '99+' : unreadCount;

  return (
    <PermissionGate permission="viewNotifications">
      <>
        <IconButton
          color="inherit"
          aria-label={t('app.notifications')}
          onClick={() => setDrawerOpen(true)}
        >
          <Badge
            badgeContent={badgeContent}
            color="error"
            invisible={unreadCount === 0}
          >
            <NotificationsNoneIcon />
          </Badge>
        </IconButton>
        <NotificationsDrawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
        />
      </>
    </PermissionGate>
  );
}
