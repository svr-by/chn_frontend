import { Link as RouterLink } from 'react-router-dom';
import { Box, Button, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';

import { useResendVerificationMutation } from '@/api/endpoints/authApi';
import { ApiErrorAlert } from '@/components/ApiErrorAlert';
import { getApiLocale } from '@/lib/locale';

interface RegisterSuccessPageProps {
  email?: string;
  inviteAccepted?: boolean;
}

export function RegisterSuccessPage({
  email,
  inviteAccepted = false,
}: RegisterSuccessPageProps) {
  const { t } = useTranslation('auth');

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        {t('registerSuccessTitle')}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        {email
          ? t('registerSuccessSubtitleWithEmail', { email })
          : t('registerSuccessSubtitle')}
      </Typography>
      {inviteAccepted && (
        <Typography variant="body2" color="success.main" sx={{ mb: 2 }}>
          {t('registerInviteAccepted')}
        </Typography>
      )}
      <Button component={RouterLink} to="/login" variant="contained" fullWidth>
        {t('backToLogin')}
      </Button>
    </Box>
  );
}

export function VerifyEmailPromptPage() {
  const { t } = useTranslation('auth');
  const { enqueueSnackbar } = useSnackbar();
  const [resendVerification, { isLoading, error }] =
    useResendVerificationMutation();

  async function handleResend() {
    try {
      await resendVerification({ locale: getApiLocale() }).unwrap();
      enqueueSnackbar(t('resendVerificationSuccess'), { variant: 'success' });
    } catch {
      // ApiErrorAlert
    }
  }

  return (
    <Box>
      <Typography variant="h5" component="h1" gutterBottom>
        {t('verifyEmailPromptTitle')}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        {t('verifyEmailPromptSubtitle')}
      </Typography>

      <ApiErrorAlert error={error} />

      <Button
        variant="contained"
        fullWidth
        disabled={isLoading}
        onClick={() => void handleResend()}
      >
        {t('resendVerification')}
      </Button>
    </Box>
  );
}
