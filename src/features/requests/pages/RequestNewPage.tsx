import { zodResolver } from '@hookform/resolvers/zod';
import {
  Box,
  Button,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useForm } from 'react-hook-form';
import { Link as RouterLink, Navigate, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';
import { z } from 'zod';

import { useCreateRequestMutation } from '@/api/endpoints/requestsApi';
import { ApiErrorAlert } from '@/components/ApiErrorAlert';
import { useAppSelector } from '@/hooks/useAppSelector';
import { usePermissions } from '@/hooks/usePermissions';

const optionalString = z
  .string()
  .trim()
  .transform((value) => (value === '' ? undefined : value))
  .optional()
  .refine((value) => value === undefined || value.length >= 1, {
    message: 'Must not be empty',
  });

const requestSchema = z.object({
  title: optionalString,
  reference: optionalString,
  notes: optionalString,
});

type RequestFormValues = z.infer<typeof requestSchema>;

export function RequestNewPage() {
  const { t } = useTranslation('requests');
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const companyId = useAppSelector((state) => state.auth.activeCompanyId);
  const { hasPermission } = usePermissions();

  const [createRequest, createState] = useCreateRequestMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RequestFormValues>({
    resolver: zodResolver(requestSchema),
    defaultValues: {
      title: '',
      reference: '',
      notes: '',
    },
  });

  if (!companyId) {
    return null;
  }

  if (!hasPermission('manageRequests')) {
    return <Navigate to="/app/requests" replace />;
  }

  async function onSubmit(values: RequestFormValues) {
    if (!companyId) {
      return;
    }

    const result = await createRequest({
      companyId,
      title: values.title,
      reference: values.reference,
      notes: values.notes,
    }).unwrap();

    enqueueSnackbar(t('toast.created'), { variant: 'success' });
    navigate(`/app/requests/${result.request.id}`);
  }

  return (
    <Stack spacing={3} maxWidth={640}>
      <Box>
        <Typography variant="h5" component="h1">
          {t('form.newTitle')}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {t('form.newSubtitle')}
        </Typography>
      </Box>

      <ApiErrorAlert error={createState.error} />

      <Box component="form" onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={2}>
          <TextField
            label={t('form.title')}
            fullWidth
            error={Boolean(errors.title)}
            helperText={errors.title?.message}
            {...register('title')}
          />
          <TextField
            label={t('form.reference')}
            fullWidth
            error={Boolean(errors.reference)}
            helperText={errors.reference?.message}
            {...register('reference')}
          />
          <TextField
            label={t('form.notes')}
            fullWidth
            multiline
            minRows={3}
            error={Boolean(errors.notes)}
            helperText={errors.notes?.message}
            {...register('notes')}
          />
          <Stack direction="row" spacing={1}>
            <Button
              type="submit"
              variant="contained"
              disabled={createState.isLoading}
            >
              {t('actions.create')}
            </Button>
            <Button component={RouterLink} to="/app/requests">
              {t('actions.cancel')}
            </Button>
          </Stack>
        </Stack>
      </Box>
    </Stack>
  );
}
