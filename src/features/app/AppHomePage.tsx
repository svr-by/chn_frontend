import { Link as RouterLink, Navigate } from 'react-router-dom';
import { Box, Link, Stack, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

import { usePermissions } from '@/hooks/usePermissions';
import { navConfig } from '@/lib/navConfig';

export function AppHomePage() {
  const { t } = useTranslation(['common', 'nav']);
  const { membership, hasPermission } = usePermissions();

  const visibleSections = navConfig.filter((item) =>
    hasPermission(item.permission),
  );

  // TODO: Change this when we have a home page
  return true ? <Navigate to="/app/requests" /> : (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        {t('common:app.welcome', {
          company: membership?.company?.name ?? t('common:app.title'),
        })}
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        {t('common:app.homeSubtitle')}
      </Typography>

      {visibleSections.length > 0 ? (
        <Stack spacing={1}>
          <Typography variant="h6">{t('common:app.availableSections')}</Typography>
          {visibleSections.map((item) => (
            <Link
              key={item.path}
              component={RouterLink}
              to={item.path}
              underline="hover"
            >
              {t(`nav:${item.labelKey}`)}
            </Link>
          ))}
        </Stack>
      ) : (
        <Typography color="text.secondary">
          {t('common:app.noSections')}
        </Typography>
      )}
    </Box>
  );
}
