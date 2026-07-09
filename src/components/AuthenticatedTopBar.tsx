import {
  AppBar,
  Button,
  Toolbar,
  Typography,
} from '@mui/material';
import { useTranslation } from 'react-i18next';

import { useGetMeQuery } from '@/api/endpoints/authApi';
import { useLogout } from '@/hooks/useLogout';
import { authStorage } from '@/lib/authStorage';

export function AuthenticatedTopBar() {
  const { t } = useTranslation('common');
  const hasSession = Boolean(authStorage.getRefreshToken());
  const { data } = useGetMeQuery(undefined, { skip: !hasSession });
  const { logout, isLoggingOut } = useLogout();

  if (!hasSession) {
    return null;
  }

  return (
    <AppBar position="fixed" color="default" elevation={1}>
      <Toolbar sx={{ gap: 2 }}>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          {t('app.title')}
        </Typography>
        {data?.user.email && (
          <Typography
            variant="body2"
            color="text.secondary"
            noWrap
            sx={{ maxWidth: { xs: 140, sm: 280 }, display: { xs: 'none', sm: 'block' } }}
          >
            {data.user.email}
          </Typography>
        )}
        <Button
          color="inherit"
          onClick={() => void logout()}
          disabled={isLoggingOut}
        >
          {t('app.logout')}
        </Button>
      </Toolbar>
    </AppBar>
  );
}

export function useHasAuthSession(): boolean {
  return Boolean(authStorage.getRefreshToken());
}
