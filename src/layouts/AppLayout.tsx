import { useState } from 'react';
import { Link as RouterLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Box,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Stack,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import MenuIcon from '@mui/icons-material/Menu';
import { NotificationBell } from '@/features/notifications/components/NotificationBell';
import { useTranslation } from 'react-i18next';

import { CompanySwitcher } from '@/components/CompanySwitcher';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { ThemeModeToggle } from '@/components/ThemeModeToggle';
import { useLogout } from '@/hooks/useLogout';
import { usePermissions } from '@/hooks/usePermissions';
import { useAppHistoryTracker } from '@/hooks/useSafeAppBack';
import { GlobalFetchProgress } from '@/components/GlobalFetchProgress';
import { navConfig } from '@/lib/navConfig';

const DRAWER_WIDTH = 260;

export function AppLayout() {
  const theme = useTheme();
  const isCompact = useMediaQuery(theme.breakpoints.down('sm'));
  const { t } = useTranslation(['common', 'nav']);
  const navigate = useNavigate();
  const location = useLocation();
  const { hasPermission } = usePermissions();
  const { logout, isLoggingOut } = useLogout();
  const [navOpen, setNavOpen] = useState(false);
  const [userMenuAnchor, setUserMenuAnchor] = useState<null | HTMLElement>(
    null,
  );

  useAppHistoryTracker();

  const visibleNavItems = navConfig.filter((item) =>
    hasPermission(item.permission),
  );

  function toggleNav() {
    setNavOpen((open) => !open);
  }

  function closeNav() {
    setNavOpen(false);
  }

  async function handleLogout() {
    setUserMenuAnchor(null);
    await logout();
  }

  function handleProfile() {
    setUserMenuAnchor(null);
    navigate('/app/settings/profile');
  }

  const drawer = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Toolbar>
        <Typography variant="h6" noWrap component="div">
          {t('common:app.title')}
        </Typography>
      </Toolbar>
      <Divider />
      <Box sx={{ px: 2, py: 1.5, display: { xs: 'block', md: 'none' } }}>
        <CompanySwitcher />
      </Box>
      <Divider sx={{ display: { xs: 'block', md: 'none' } }} />
      <List sx={{ flex: 1, px: 1 }}>
        {/* // TODO: Uncomment this when we have a home page */}
        {/* <ListItemButton
          component={RouterLink}
          to="/app"
          selected={location.pathname === '/app'}
          onClick={closeNav}
        >
          <ListItemIcon sx={{ minWidth: 40 }}>
            <HomeIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText
            primary={t('common:app.home')}
            slotProps={{ primary: { noWrap: true } }}
          />
        </ListItemButton> */}
        {visibleNavItems.map((item) => {
          const Icon = item.icon;
          return (
            <ListItemButton
              key={item.path}
              component={RouterLink}
              to={item.path}
              selected={location.pathname.startsWith(item.path)}
              onClick={closeNav}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                <Icon fontSize="small" />
              </ListItemIcon>
              <ListItemText
                primary={t(`nav:${item.labelKey}`)}
                slotProps={{ primary: { noWrap: true } }}
              />
            </ListItemButton>
          );
        })}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <AppBar
        position="fixed"
        sx={{
          zIndex: (muiTheme) => muiTheme.zIndex.drawer + 1,
          width: '100%',
        }}
      >
        <Toolbar sx={{ gap: { xs: 0.5, sm: 1 }, minHeight: { xs: 56, sm: 64 } }}>
          <IconButton
            color="inherit"
            edge="start"
            onClick={toggleNav}
            aria-label={navOpen ? t('common:app.closeNav') : t('common:app.openNav')}
            size="large"
          >
            <MenuIcon />
          </IconButton>
          <Box
            component="img"
            src="/assets/logo_short_white.png"
            alt={t('common:app.title')}
            sx={{
              display: { xs: 'block', sm: 'none' },
              height: 28,
              width: 'auto',
              mr: 1,
            }}
          />
          <Box
            sx={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              minWidth: 0,
            }}
          >
            <Box sx={{ display: { xs: 'none', md: 'block' }, minWidth: 0 }}>
              <CompanySwitcher />
            </Box>
          </Box>
          <Stack direction="row" alignItems="center" spacing={0}>
            <LanguageSwitcher />
            <ThemeModeToggle />
            <NotificationBell />
            <IconButton
              color="inherit"
              onClick={(event) => setUserMenuAnchor(event.currentTarget)}
              aria-label={t('common:app.accountMenu')}
              size="large"
            >
              <AccountCircleIcon />
            </IconButton>
          </Stack>
          <Menu
            anchorEl={userMenuAnchor}
            open={Boolean(userMenuAnchor)}
            onClose={() => setUserMenuAnchor(null)}
          >
            <MenuItem onClick={handleProfile}>{t('common:app.profile')}</MenuItem>
            <MenuItem onClick={() => void handleLogout()} disabled={isLoggingOut}>
              {t('common:app.logout')}
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>
      <GlobalFetchProgress />

      <Drawer
        variant="temporary"
        anchor="left"
        open={navOpen}
        onClose={closeNav}
        ModalProps={{ keepMounted: true }}
        sx={{
          zIndex: (muiTheme) => muiTheme.zIndex.drawer,
          '& .MuiDrawer-paper': {
            width: isCompact ? 'min(100vw, 320px)' : DRAWER_WIDTH,
            boxSizing: 'border-box',
          },
        }}
      >
        {drawer}
      </Drawer>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: '100%',
          p: { xs: 2, sm: 3 },
          mt: { xs: 7, sm: 8 },
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
}
