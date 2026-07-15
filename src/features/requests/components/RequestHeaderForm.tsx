import { useEffect, useMemo } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Box, Button, Stack, TextField } from '@mui/material';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';
import { z } from 'zod';

import type { MaterialRequest } from '@/api/generated/models/materialRequest';
import { useUpdateRequestMutation } from '@/api/endpoints/requestsApi';
import { ApiErrorAlert } from '@/components/ApiErrorAlert';

type HeaderFormValues = {
  title: string;
  notes?: string;
};

interface RequestHeaderFormProps {
  companyId: string;
  request: MaterialRequest;
  editable: boolean;
}

export function RequestHeaderForm({
  companyId,
  request,
  editable,
}: RequestHeaderFormProps) {
  const { t } = useTranslation('requests');
  const { enqueueSnackbar } = useSnackbar();

  const [updateRequest, updateState] = useUpdateRequestMutation();

  const headerSchema = useMemo(
    () =>
      z.object({
        title: z.string().trim().min(3, {
          message: t('validation:minLength', { min: 3 }),
        }),
        notes: z.string().trim().optional(),
      }),
    [t],
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { isDirty, errors },
  } = useForm<HeaderFormValues>({
    resolver: zodResolver(headerSchema),
    defaultValues: {
      title: request.title ?? '',
      notes: request.notes ?? '',
    },
  });

  useEffect(() => {
    reset({
      title: request.title ?? '',
      notes: request.notes ?? '',
    });
  }, [request, reset]);

  async function onSubmit(values: HeaderFormValues) {
    await updateRequest({
      companyId,
      requestId: request.id,
      title: values.title || null,
      notes: values.notes || null,
    }).unwrap();

    enqueueSnackbar(t('toast.updated'), { variant: 'success' });
  }

  if (!editable) {
    return (
      <Stack spacing={1}>
        {request.title ? (
          <Box>
            <strong>{t('form.title')}:</strong> {request.title}
          </Box>
        ) : null}
        {request.notes ? (
          <Box>
            <strong>{t('form.notes')}:</strong> {request.notes}
          </Box>
        ) : null}
      </Stack>
    );
  }

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)}>
      <ApiErrorAlert error={updateState.error} />
      <Stack spacing={2}>
        <TextField
          label={t('form.title')}
          fullWidth
          error={Boolean(errors.title)}
          helperText={errors.title?.message}
          {...register('title')}
        />
        <TextField
          label={t('form.notes')}
          fullWidth
          multiline
          minRows={2}
          error={Boolean(errors.notes)}
          helperText={errors.notes?.message}
          {...register('notes')}
        />
        <Box>
          <Button
            type="submit"
            variant="outlined"
            disabled={!isDirty || updateState.isLoading}
          >
            {t('actions.saveHeader')}
          </Button>
        </Box>
      </Stack>
    </Box>
  );
}
