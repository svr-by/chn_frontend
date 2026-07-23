import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import type { SerializedError } from '@reduxjs/toolkit';
import { Alert } from '@mui/material';
import { useTranslation } from 'react-i18next';

import { isApiError } from '@/api/baseApi';
import type { ApiError } from '@/types/api';

interface ApiErrorAlertProps {
  error: FetchBaseQueryError | SerializedError | undefined;
}

function extractApiError(
  error: FetchBaseQueryError | SerializedError,
): ApiError['error'] | null {
  if (!('data' in error) || !isApiError(error.data)) {
    return null;
  }

  return error.data.error;
}

export function ApiErrorAlert({ error }: ApiErrorAlertProps) {
  const { t } = useTranslation('errors');

  if (!error) {
    return null;
  }

  const apiError = extractApiError(error);

  if (apiError) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {t(apiError.code, { defaultValue: apiError.message })}
      </Alert>
    );
  }

  if ('status' in error) {
    const status =
      typeof error.status === 'number' || typeof error.status === 'string'
        ? String(error.status)
        : 'unknown';

    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {t('UNKNOWN_ERROR', { defaultValue: `Request failed (${status})` })}
      </Alert>
    );
  }

  return (
    <Alert severity="error" sx={{ mb: 2 }}>
      {t('UNKNOWN_ERROR', {
        defaultValue:
          error.message ?? 'Something went wrong. Please try again.',
      })}
    </Alert>
  );
}
