import { Outlet } from 'react-router-dom';
import { Box, Card, CardContent, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

import { AuthenticatedTopBar } from '@/components/navigation/authenticatedTopBar/AuthenticatedTopBar';
import { authStorage } from '@/lib/authStorage';

interface AuthLayoutProps {
  /** `card` — login/register shell with logo; `plain` — full-width content (onboarding, prompts). */
  variant?: 'card' | 'plain';
  centered?: boolean;
  maxWidth?: number | string;
}

export function AuthLayout({
  variant = 'card',
  centered = true,
  maxWidth,
}: AuthLayoutProps) {
  const { t } = useTranslation('common');
  const hasSession = Boolean(authStorage.getRefreshToken());
  const contentMaxWidth = maxWidth ?? (variant === 'card' ? 440 : 560);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: 'background.default',
      }}
    >
      <AuthenticatedTopBar />
      <Box
        component="main"
        sx={{
          minHeight: '100vh',
          p: 2,
          pt: hasSession ? 10 : 2,
          ...(centered
            ? {
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }
            : {}),
        }}
      >
        {variant === 'card' ? (
          <Card sx={{ width: '100%', maxWidth: contentMaxWidth }}>
            <CardContent sx={{ p: 4 }}>
              <Box sx={{ textAlign: 'center', mb: 3 }}>
                <Box
                  component="img"
                  src="/assets/logo.png"
                  alt={t('app.title')}
                  sx={{
                    display: 'block',
                    height: 40,
                    width: 'auto',
                    mx: 'auto',
                    mb: 0.5,
                  }}
                />
                <Typography
                  variant="body1"
                  color="text.secondary"
                  component="p"
                  fontSize={12}
                >
                  {t('app.tagline')}
                </Typography>
              </Box>
              <Outlet />
            </CardContent>
          </Card>
        ) : (
          <Box
            sx={{
              width: '100%',
              maxWidth: centered ? contentMaxWidth : 'none',
            }}
          >
            <Outlet />
          </Box>
        )}
      </Box>
    </Box>
  );
}
