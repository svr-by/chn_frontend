import { zodResolver } from '@hookform/resolvers/zod';
import { Link as RouterLink } from 'react-router-dom';
import { Box, Button, Link, TextField, Typography } from '@mui/material';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';

import { useForgotPasswordMutation } from '@/api/endpoints/authApi';
import { ApiErrorAlert } from '@/components/ApiErrorAlert';
import { getApiLocale } from '@/lib/locale';

const forgotSchema = z.object({
  email: z.string().email(),
});

type ForgotFormValues = z.infer<typeof forgotSchema>;

export function ForgotPasswordPage() {
  const { t } = useTranslation('auth');
  const [forgotPassword, { isLoading, error, isSuccess }] =
    useForgotPasswordMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotFormValues>({
    resolver: zodResolver(forgotSchema),
    defaultValues: { email: '' },
  });

  async function onSubmit(values: ForgotFormValues) {
    try {
      await forgotPassword({
        email: values.email,
        locale: getApiLocale(),
      }).unwrap();
    } catch {
      // Always show generic success per API contract; errors only for validation
    }
  }

  return (
    <Box component="form" onSubmit={(event) => void handleSubmit(onSubmit)(event)}>
      <Typography variant="h6" gutterBottom>
        {t('forgotPasswordTitle')}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        {t('forgotPasswordSubtitle')}
      </Typography>

      <ApiErrorAlert error={error} />

      {isSuccess ? (
        <Typography color="success.main">{t('forgotPasswordSuccess')}</Typography>
      ) : (
        <>
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
          <Button
            type="submit"
            variant="contained"
            fullWidth
            sx={{ mt: 2 }}
            disabled={isLoading}
          >
            {t('forgotPasswordSubmit')}
          </Button>
        </>
      )}

      <Box sx={{ mt: 2, textAlign: 'center' }}>
        <Link component={RouterLink} to="/login" underline="hover">
          {t('backToLogin')}
        </Link>
      </Box>
    </Box>
  );
}
