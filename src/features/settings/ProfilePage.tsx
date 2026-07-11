import { Box, Stack, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

import { usePermissions } from '@/hooks/usePermissions';

export function ProfilePage() {
  const { t } = useTranslation('profile');
  const { user } = usePermissions();

  if (!user) {
    return null;
  }

  const displayName = [user.firstName, user.lastName].filter(Boolean).join(' ');

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h5" component="h1">
          {t('title')}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {t('subtitle')}
        </Typography>
      </Box>

      <Stack spacing={1}>
        {displayName ? (
          <Typography variant="body1">
            {t('name', { name: displayName })}
          </Typography>
        ) : null}
        <Typography variant="body1">{t('email', { email: user.email })}</Typography>
        <Typography variant="body2" color="text.secondary">
          {user.emailVerified ? t('emailVerified') : t('emailNotVerified')}
        </Typography>
      </Stack>
    </Stack>
  );
}
