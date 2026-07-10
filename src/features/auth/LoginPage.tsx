import { zodResolver } from '@hookform/resolvers/zod';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { Box, Button, Link, TextField } from '@mui/material';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';
import { z } from 'zod';

import { authApi, useLoginMutation } from '@/api/endpoints/authApi';
import { ApiErrorAlert } from '@/components/ApiErrorAlert';
import { PasswordField } from '@/components/PasswordField';
import { useAppDispatch } from '@/hooks/useAppDispatch';
import {
  isEmailVerified,
  resolveAuthenticatedRedirect,
} from '@/lib/permissions';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginPage() {
  const { t } = useTranslation('auth');
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const [login, { isLoading, error }] = useLoginMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  async function onSubmit(values: LoginFormValues) {
    try {
      await login(values).unwrap();
      const me = await dispatch(
        authApi.endpoints.getMe.initiate(undefined, { forceRefetch: true }),
      ).unwrap();

      if (!isEmailVerified(me.user)) {
        enqueueSnackbar(t('loginUnverified'), { variant: 'warning' });
      }

      enqueueSnackbar(t('loginSuccess'), { variant: 'success' });
      navigate(resolveAuthenticatedRedirect(me.user));
    } catch {
      // error shown via ApiErrorAlert
    }
  }

  return (
    <Box component="form" onSubmit={(event) => void handleSubmit(onSubmit)(event)}>
      <ApiErrorAlert error={error} />

      <TextField
        {...register('email')}
        label={t('email')}
        type="email"
        fullWidth
        margin="normal"
        autoComplete="email"
        error={Boolean(errors.email)}
        helperText={errors.email?.message}
      />

      <PasswordField
        {...register('password')}
        label={t('password')}
        fullWidth
        margin="normal"
        autoComplete="current-password"
        error={Boolean(errors.password)}
        helperText={errors.password?.message}
      />

      <Box sx={{ textAlign: 'right', mt: 1 }}>
        <Link component={RouterLink} to="/forgot-password" underline="hover" variant="body2">
          {t('forgotPasswordLink')}
        </Link>
      </Box>

      <Button
        type="submit"
        variant="contained"
        fullWidth
        sx={{ mt: 2 }}
        disabled={isLoading}
      >
        {t('login')}
      </Button>

      <Box sx={{ mt: 2, textAlign: 'center' }}>
        <Link component={RouterLink} to="/register" underline="hover">
          {t('noAccount')}
        </Link>
      </Box>
    </Box>
  );
}
