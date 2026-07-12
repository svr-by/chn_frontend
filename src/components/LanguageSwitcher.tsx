import LanguageIcon from '@mui/icons-material/Language';
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

import { setUiLocale } from '@/lib/locale';
import {
  SUPPORTED_UI_LOCALES,
  UI_LOCALE_HTML_LANG,
  UI_LOCALE_LABELS,
  type UiLocale,
} from '@/lib/supportedLocales';

export function LanguageSwitcher() {
  const { t, i18n } = useTranslation('common');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  function handleSelect(locale: UiLocale) {
    setUiLocale(locale);
    void i18n.changeLanguage(locale);
    document.documentElement.lang = UI_LOCALE_HTML_LANG[locale];
    setAnchorEl(null);
  }

  return (
    <>
      <Tooltip title={t('app.language')}>
        <IconButton
          color="inherit"
          onClick={(event) => setAnchorEl(event.currentTarget)}
          aria-label={t('app.language')}
          size="large"
        >
          <LanguageIcon />
        </IconButton>
      </Tooltip>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        {SUPPORTED_UI_LOCALES.map((locale) => (
          <MenuItem
            key={locale}
            selected={i18n.language === locale}
            onClick={() => handleSelect(locale)}
          >
            <ListItemIcon sx={{ minWidth: 32 }}>
              <LanguageIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>{UI_LOCALE_LABELS[locale]}</ListItemText>
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}
