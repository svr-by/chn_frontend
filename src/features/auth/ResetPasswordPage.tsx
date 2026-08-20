import { zodResolver } from '@hookform/resolvers/zod';
import {
  Link as RouterLink,
  useNavigate,
  useSearchParams,
} from 'react-router-dom';
import { Box, Button, Link, Typography } from '@mui/material';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';
import { z } from 'zod';

import { useResetPasswordMutation } from '@/api/endpoints/authApi';
import { ApiErrorAlert } from '@/components/feedback/apiErrorAlert/ApiErrorAlert';
import { PasswordField } from '@/components/forms/passwordField/PasswordField';

const resetSchema = z
  .object({
    password: z.string().min(8),
    confirmPassword: z.string().min(8),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type ResetFormValues = z.infer<typeof resetSchema>;

export function ResetPasswordPage() {
  const { t } = useTranslation('auth');
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const [resetPassword, { isLoading, error }] = useResetPasswordMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetFormValues>({
    resolver: zodResolver(resetSchema),
    defaultValues: { password: '', confirmPassword: '' },
  });

  async function onSubmit(values: ResetFormValues) {
    if (!token) {
      return;
    }

    try {
      await resetPassword({ token, password: values.password }).unwrap();
      enqueueSnackbar(t('resetPasswordSuccess'), { variant: 'success' });
      navigate('/login');
    } catch {
      // ApiErrorAlert
    }
  }

  if (!token) {
    return (
      <Box>
        <Typography color="error">{t('resetPasswordMissingToken')}</Typography>
        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Link component={RouterLink} to="/forgot-password" underline="hover">
            {t('forgotPasswordTitle')}
          </Link>
        </Box>
      </Box>
    );
  }

  return (
    <Box
      component="form"
      onSubmit={(event) => void handleSubmit(onSubmit)(event)}
    >
      <Typography variant="h6" gutterBottom>
        {t('resetPasswordTitle')}
      </Typography>

      <ApiErrorAlert error={error} />

      <PasswordField
        {...register('password')}
        label={t('password')}
        fullWidth
        margin="normal"
        autoComplete="new-password"
        error={Boolean(errors.password)}
        helperText={errors.password?.message ?? t('passwordHint')}
      />

      <PasswordField
        {...register('confirmPassword')}
        label={t('confirmPassword')}
        fullWidth
        margin="normal"
        autoComplete="new-password"
        error={Boolean(errors.confirmPassword)}
        helperText={errors.confirmPassword?.message}
      />

      <Button
        type="submit"
        variant="contained"
        fullWidth
        sx={{ mt: 2 }}
        disabled={isLoading}
      >
        {t('resetPasswordSubmit')}
      </Button>

      <Box sx={{ mt: 2, textAlign: 'center' }}>
        <Link component={RouterLink} to="/login" underline="hover">
          {t('backToLogin')}
        </Link>
      </Box>
    </Box>
  );
}
