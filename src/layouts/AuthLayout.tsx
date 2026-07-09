import { Outlet } from 'react-router-dom';
import { Box, Card, CardContent, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

import {
  AuthenticatedTopBar,
  useHasAuthSession,
} from '@/components/AuthenticatedTopBar';

export function AuthLayout() {
  const { t } = useTranslation('common');
  const hasSession = useHasAuthSession();

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: 'background.default',
      }}
    >
      <AuthenticatedTopBar />
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 2,
          pt: hasSession ? 10 : 2,
        }}
      >
        <Card sx={{ width: '100%', maxWidth: 440 }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h5" component="h1" gutterBottom textAlign="center">
              {t('app.title')}
            </Typography>
            <Outlet />
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}
