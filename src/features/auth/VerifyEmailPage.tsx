import { useEffect, useRef, useState } from 'react';
import { Link as RouterLink, useSearchParams } from 'react-router-dom';
import { Box, Button, Link, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';

import { useVerifyEmailMutation } from '@/api/endpoints/authApi';
import { ApiErrorAlert } from '@/components/feedback/apiErrorAlert/ApiErrorAlert';

export function VerifyEmailPage() {
  const { t } = useTranslation('auth');
  const { enqueueSnackbar } = useSnackbar();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const [verifyEmail, { isLoading, error, isSuccess }] =
    useVerifyEmailMutation();
  const [submitted, setSubmitted] = useState(false);
  const attemptedRef = useRef(false);

  useEffect(() => {
    if (!token || attemptedRef.current) {
      return;
    }

    attemptedRef.current = true;
    setSubmitted(true);

    void verifyEmail({ token })
      .unwrap()
      .then(() => {
        enqueueSnackbar(t('verifyEmailSuccess'), { variant: 'success' });
      })
      .catch(() => {
        // ApiErrorAlert handles display
      });
  }, [token, verifyEmail, enqueueSnackbar, t]);

  if (!token) {
    return (
      <Box>
        <Typography color="error">{t('verifyEmailMissingToken')}</Typography>
        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Link component={RouterLink} to="/login" underline="hover">
            {t('backToLogin')}
          </Link>
        </Box>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        {t('verifyEmailTitle')}
      </Typography>

      <ApiErrorAlert error={error} />

      {isLoading && <Typography>{t('verifyEmailInProgress')}</Typography>}

      {isSuccess && (
        <Typography color="success.main" sx={{ mb: 2 }}>
          {t('verifyEmailSuccess')}
        </Typography>
      )}

      {!isLoading && !isSuccess && submitted && !error && (
        <Button
          variant="contained"
          fullWidth
          onClick={() => void verifyEmail({ token })}
        >
          {t('verifyEmailRetry')}
        </Button>
      )}

      <Box sx={{ mt: 2, textAlign: 'center' }}>
        <Link component={RouterLink} to="/login" underline="hover">
          {t('backToLogin')}
        </Link>
      </Box>
    </Box>
  );
}
