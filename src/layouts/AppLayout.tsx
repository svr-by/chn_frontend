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
  Toolbar,
  Typography,
} from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import HomeIcon from '@mui/icons-material/Home';
import MenuIcon from '@mui/icons-material/Menu';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import { useTranslation } from 'react-i18next';

import { useLogout } from '@/hooks/useLogout';
import { usePermissions } from '@/hooks/usePermissions';
import { GlobalFetchProgress } from '@/components/GlobalFetchProgress';
import { navConfig } from '@/lib/navConfig';

const DRAWER_WIDTH = 260;

export function AppLayout() {
  const { t } = useTranslation(['common', 'nav']);
  const navigate = useNavigate();
  const location = useLocation();
  const { hasPermission } = usePermissions();
  const { logout, isLoggingOut } = useLogout();
  const [navOpen, setNavOpen] = useState(false);
  const [userMenuAnchor, setUserMenuAnchor] = useState<null | HTMLElement>(
    null,
  );

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
      <List sx={{ flex: 1, px: 1 }}>
        <ListItemButton
          component={RouterLink}
          to="/app"
          selected={location.pathname === '/app'}
          onClick={closeNav}
        >
          <ListItemIcon sx={{ minWidth: 40 }}>
            <HomeIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary={t('common:app.home')} />
        </ListItemButton>
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
              <ListItemText primary={t(`nav:${item.labelKey}`)} />
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
        <Toolbar sx={{ gap: 1 }}>
          <IconButton
            color="inherit"
            edge="start"
            onClick={toggleNav}
            aria-label={navOpen ? t('common:app.closeNav') : t('common:app.openNav')}
          >
            <MenuIcon />
          </IconButton>
          <Box sx={{ flex: 1 }} />
          <IconButton color="inherit" disabled aria-label={t('common:app.notifications')}>
            <NotificationsNoneIcon />
          </IconButton>
          <IconButton
            color="inherit"
            onClick={(event) => setUserMenuAnchor(event.currentTarget)}
            aria-label={t('common:app.accountMenu')}
          >
            <AccountCircleIcon />
          </IconButton>
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
            width: DRAWER_WIDTH,
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
          p: 3,
          mt: 8,
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
}
