import LogoutIcon from '@mui/icons-material/Logout';
import {
  AppBar,
  Box,
  IconButton,
  Stack,
  Toolbar,
  Tooltip,
  Typography,
} from '@mui/material';
import { useTranslation } from 'react-i18next';

import { useGetMeQuery } from '@/api/endpoints/authApi';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { ThemeModeToggle } from '@/components/ThemeModeToggle';
import { useLogout } from '@/hooks/useLogout';
import { authStorage } from '@/lib/authStorage';

function LocaleThemeControls() {
  return (
    <Stack direction="row" alignItems="center">
      <LanguageSwitcher />
      <ThemeModeToggle />
    </Stack>
  );
}

export function AuthenticatedTopBar() {
  const { t } = useTranslation('common');
  const hasSession = Boolean(authStorage.getRefreshToken());
  const { data } = useGetMeQuery(undefined, { skip: !hasSession });
  const { logout, isLoggingOut } = useLogout();

  if (!hasSession) {
    return (
      <Stack
        direction="row"
        alignItems="center"
        sx={{
          position: 'fixed',
          top: 8,
          right: 8,
          zIndex: (theme) => theme.zIndex.appBar + 1,
        }}
      >
        <LocaleThemeControls />
      </Stack>
    );
  }

  return (
    <AppBar position="fixed" color="default" elevation={0}>
      <Toolbar sx={{ gap: 1 }}>
        <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center' }}>
          <Box
            component="img"
            src="/assets/logo_short.png"
            alt={t('app.title')}
            sx={{ display: 'block', height: 28, width: 'auto' }}
          />
        </Box>
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
        <LocaleThemeControls />
        <Tooltip title={t('app.logout')}>
          <IconButton
            color="inherit"
            onClick={() => void logout()}
            disabled={isLoggingOut}
            aria-label={t('app.logout')}
            size="large"
          >
            <LogoutIcon />
          </IconButton>
        </Tooltip>
      </Toolbar>
    </AppBar>
  );
}
