import { Box, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

export function AccessSuspendedPage() {
  const { t } = useTranslation('auth');

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        {t('accessSuspendedTitle')}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {t('accessSuspendedSubtitle')}
      </Typography>
    </Box>
  );
}
