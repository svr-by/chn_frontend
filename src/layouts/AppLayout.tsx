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
  ListItemText,
  Menu,
  MenuItem,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import { useTranslation } from 'react-i18next';

import { useLogoutMutation } from '@/api/endpoints/authApi';
import { baseApi } from '@/api/baseApi';
import { CompanySwitcher } from '@/components/CompanySwitcher';
import { useAppDispatch } from '@/hooks/useAppDispatch';
import { usePermissions } from '@/hooks/usePermissions';
import { navConfig } from '@/lib/navConfig';
import { authStorage } from '@/lib/authStorage';
import { clearSession } from '@/store/slices/authSlice';

const DRAWER_WIDTH = 260;

export function AppLayout() {
  const { t } = useTranslation(['common', 'nav']);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const location = useLocation();
  const { user, hasPermission } = usePermissions();
  const [logout] = useLogoutMutation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuAnchor, setUserMenuAnchor] = useState<null | HTMLElement>(
    null,
  );

  const visibleNavItems = navConfig.filter((item) =>
    hasPermission(item.permission),
  );

  async function handleLogout() {
    const refreshToken = authStorage.getRefreshToken();
    try {
      if (refreshToken) {
        await logout({ refreshToken }).unwrap();
      }
    } catch {
      dispatch(clearSession());
      dispatch(baseApi.util.resetApiState());
    } finally {
      setUserMenuAnchor(null);
      navigate('/login', { replace: true });
    }
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
          onClick={() => setMobileOpen(false)}
        >
          <ListItemText primary={t('common:app.home')} />
        </ListItemButton>
        {visibleNavItems.map((item) => (
          <ListItemButton
            key={item.path}
            component={RouterLink}
            to={item.path}
            selected={location.pathname.startsWith(item.path)}
            onClick={() => setMobileOpen(false)}
          >
            <ListItemText primary={t(`nav:${item.labelKey}`)} />
          </ListItemButton>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <AppBar
        position="fixed"
        sx={{
          zIndex: (muiTheme) => muiTheme.zIndex.drawer + 1,
          ml: { md: `${DRAWER_WIDTH}px` },
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
        }}
      >
        <Toolbar sx={{ gap: 2 }}>
          {isMobile && (
            <IconButton
              color="inherit"
              edge="start"
              onClick={() => setMobileOpen(true)}
              aria-label="open navigation"
            >
              <MenuIcon />
            </IconButton>
          )}
          <Box sx={{ flex: 1 }} />
          <CompanySwitcher />
          <IconButton color="inherit" disabled aria-label={t('common:app.notifications')}>
            <NotificationsNoneIcon />
          </IconButton>
          <IconButton
            color="inherit"
            onClick={(event) => setUserMenuAnchor(event.currentTarget)}
          >
            <Typography variant="body2" sx={{ maxWidth: 180 }} noWrap>
              {user?.email}
            </Typography>
          </IconButton>
          <Menu
            anchorEl={userMenuAnchor}
            open={Boolean(userMenuAnchor)}
            onClose={() => setUserMenuAnchor(null)}
          >
            <MenuItem onClick={() => void handleLogout()}>
              {t('common:app.logout')}
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Box
        component="nav"
        sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}
      >
        <Drawer
          variant={isMobile ? 'temporary' : 'permanent'}
          open={isMobile ? mobileOpen : true}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            '& .MuiDrawer-paper': {
              width: DRAWER_WIDTH,
              boxSizing: 'border-box',
            },
          }}
        >
          {drawer}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          mt: 8,
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
}
