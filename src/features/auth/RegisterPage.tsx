import { zodResolver } from '@hookform/resolvers/zod';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { Box, Button, Link, TextField } from '@mui/material';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';
import { z } from 'zod';

import { useRegisterMutation } from '@/api/endpoints/authApi';
import { ApiErrorAlert } from '@/components/ApiErrorAlert';
import { PasswordField } from '@/components/PasswordField';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().min(1).optional().or(z.literal('')),
  lastName: z.string().min(1).optional().or(z.literal('')),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export function RegisterPage() {
  const { t } = useTranslation('auth');
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [registerUser, { isLoading, error }] = useRegisterMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { email: '', password: '', firstName: '', lastName: '' },
  });

  async function onSubmit(values: RegisterFormValues) {
    try {
      await registerUser({
        email: values.email,
        password: values.password,
        firstName: values.firstName || undefined,
        lastName: values.lastName || undefined,
      }).unwrap();
      enqueueSnackbar(t('registerSuccess'), { variant: 'success' });
      navigate('/login');
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
        autoComplete="new-password"
        error={Boolean(errors.password)}
        helperText={errors.password?.message ?? t('passwordHint')}
      />

      <TextField
        {...register('firstName')}
        label={t('firstName')}
        fullWidth
        margin="normal"
        autoComplete="given-name"
        error={Boolean(errors.firstName)}
        helperText={errors.firstName?.message}
      />

      <TextField
        {...register('lastName')}
        label={t('lastName')}
        fullWidth
        margin="normal"
        autoComplete="family-name"
        error={Boolean(errors.lastName)}
        helperText={errors.lastName?.message}
      />

      <Button
        type="submit"
        variant="contained"
        fullWidth
        sx={{ mt: 2 }}
        disabled={isLoading}
      >
        {t('register')}
      </Button>

      <Box sx={{ mt: 2, textAlign: 'center' }}>
        <Link component={RouterLink} to="/login" underline="hover">
          {t('hasAccount')}
        </Link>
      </Box>
    </Box>
  );
}
