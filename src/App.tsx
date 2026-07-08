import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  AppBar,
  Box,
  Button,
  Container,
  Toolbar,
  Typography,
} from '@mui/material';
import { useSnackbar } from 'notistack';

export function HomePage() {
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const [isChecking, setIsChecking] = useState(false);

  async function handleHealthCheck() {
    setIsChecking(true);

    try {
      const response = await fetch('/health');

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data: unknown = await response.json();
      enqueueSnackbar(
        `${t('app.healthOk')}${typeof data === 'object' && data !== null && 'status' in data ? `: ${String((data as { status: string }).status)}` : ''}`,
        { variant: 'success' },
      );
    } catch {
      enqueueSnackbar(t('app.healthError'), { variant: 'error' });
    } finally {
      setIsChecking(false);
    }
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="static" elevation={0}>
        <Toolbar>
          <Typography variant="h6" component="h1">
            {t('app.title')}
          </Typography>
        </Toolbar>
      </AppBar>

      <Container
        maxWidth="sm"
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 2,
          py: 6,
        }}
      >
        <Typography variant="h4" component="h2" textAlign="center">
          {t('app.shellReady')}
        </Typography>

        <Button
          variant="contained"
          onClick={() => void handleHealthCheck()}
          disabled={isChecking}
        >
          {t('app.checkHealth')}
        </Button>
      </Container>
    </Box>
  );
}
