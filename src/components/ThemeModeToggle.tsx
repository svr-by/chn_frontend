import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import SettingsBrightnessIcon from '@mui/icons-material/SettingsBrightness';
import {
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Tooltip,
} from '@mui/material';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useThemeMode } from '@/hooks/useThemeMode';
import { THEME_MODES, type ThemeMode } from '@/lib/themeMode';

const THEME_ICONS: Record<ThemeMode, typeof Brightness7Icon> = {
  light: Brightness7Icon,
  dark: Brightness4Icon,
  system: SettingsBrightnessIcon,
};

interface ThemeModeToggleProps {
  onModeChange?: (mode: ThemeMode) => void;
}

export function ThemeModeToggle({ onModeChange }: ThemeModeToggleProps) {
  const { t } = useTranslation('common');
  const { mode, setThemeMode } = useThemeMode();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const CurrentIcon = THEME_ICONS[mode];

  function handleSelect(nextMode: ThemeMode) {
    setThemeMode(nextMode);
    onModeChange?.(nextMode);
    setAnchorEl(null);
  }

  const labels: Record<ThemeMode, string> = {
    light: t('app.themeLight'),
    dark: t('app.themeDark'),
    system: t('app.themeSystem'),
  };

  return (
    <>
      <Tooltip title={t('app.theme')}>
        <IconButton
          color="inherit"
          onClick={(event) => setAnchorEl(event.currentTarget)}
          aria-label={t('app.theme')}
          size="large"
        >
          <CurrentIcon />
        </IconButton>
      </Tooltip>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        {THEME_MODES.map((themeMode) => {
          const Icon = THEME_ICONS[themeMode];
          return (
            <MenuItem
              key={themeMode}
              selected={mode === themeMode}
              onClick={() => handleSelect(themeMode)}
            >
              <ListItemIcon sx={{ minWidth: 32 }}>
                <Icon fontSize="small" />
              </ListItemIcon>
              <ListItemText>{labels[themeMode]}</ListItemText>
            </MenuItem>
          );
        })}
      </Menu>
    </>
  );
}
