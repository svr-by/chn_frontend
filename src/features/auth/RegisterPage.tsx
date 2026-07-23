import { zodResolver } from '@hookform/resolvers/zod';
import {
  Link as RouterLink,
  useNavigate,
  useSearchParams,
} from 'react-router-dom';
import { Box, Button, Link, TextField } from '@mui/material';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';

import { useRegisterMutation } from '@/api/endpoints/authApi';
import { ApiErrorAlert } from '@/components/ApiErrorAlert';
import { PasswordField } from '@/components/PasswordField';
import { getApiLocale } from '@/lib/locale';

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
  const [searchParams] = useSearchParams();
  const inviteToken = searchParams.get('inviteToken') ?? undefined;
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
      const result = await registerUser({
        email: values.email,
        password: values.password,
        firstName: values.firstName || undefined,
        lastName: values.lastName || undefined,
        inviteToken,
        locale: getApiLocale(),
      }).unwrap();

      const params = new URLSearchParams();
      if (values.email) {
        params.set('email', values.email);
      }
      if (result.acceptedMembership) {
        params.set('inviteAccepted', '1');
      }
      navigate(`/register/success?${params.toString()}`);
    } catch {
      // error shown via ApiErrorAlert
    }
  }

  return (
    <Box
      component="form"
      onSubmit={(event) => void handleSubmit(onSubmit)(event)}
    >
      <ApiErrorAlert error={error} />

      {inviteToken && (
        <Box sx={{ mb: 2, typography: 'body2', color: 'text.secondary' }}>
          {t('registerWithInvite')}
        </Box>
      )}

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
      />

      <TextField
        {...register('lastName')}
        label={t('lastName')}
        fullWidth
        margin="normal"
        autoComplete="family-name"
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
