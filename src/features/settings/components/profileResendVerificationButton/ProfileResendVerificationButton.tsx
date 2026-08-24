import { IconButton, Tooltip } from '@mui/material';
import ForwardToInboxOutlinedIcon from '@mui/icons-material/ForwardToInboxOutlined';
import { useTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';

import { isApiError } from '@/api/baseApi';
import { useResendVerificationMutation } from '@/api/endpoints/authApi';
import { getApiLocale } from '@/lib/locale';

export function ProfileResendVerificationButton() {
  const { t } = useTranslation(['profile', 'auth', 'errors']);
  const { enqueueSnackbar } = useSnackbar();
  const [resendVerification, { isLoading }] = useResendVerificationMutation();

  async function handleResend() {
    try {
      await resendVerification({ locale: getApiLocale() }).unwrap();
      enqueueSnackbar(t('auth:resendVerificationSuccess'), {
        variant: 'success',
      });
    } catch (error) {
      const apiError =
        error &&
        typeof error === 'object' &&
        'data' in error &&
        isApiError(error.data)
          ? error.data.error
          : null;
      enqueueSnackbar(
        apiError
          ? t(`errors:${apiError.code}`, { defaultValue: apiError.message })
          : t('errors:UNKNOWN_ERROR'),
        { variant: 'error' },
      );
    }
  }

  return (
    <Tooltip title={t('profile:resendVerification')}>
      <span>
        <IconButton
          size="small"
          aria-label={t('profile:resendVerification')}
          disabled={isLoading}
          onClick={() => void handleResend()}
        >
          <ForwardToInboxOutlinedIcon fontSize="small" />
        </IconButton>
      </span>
    </Tooltip>
  );
}
