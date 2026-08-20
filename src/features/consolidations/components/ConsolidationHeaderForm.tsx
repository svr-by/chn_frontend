import { useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
} from '@mui/material';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';
import { z } from 'zod';

import type { Consolidation } from '@/api/generated/models/consolidation';
import type { ConsolidationTransportMode } from '@/api/generated/models/consolidationTransportMode';
import { useUpdateConsolidationMutation } from '@/api/endpoints/consolidationsApi';
import { ApiErrorAlert } from '@/components/feedback/apiErrorAlert/ApiErrorAlert';

type TransportModeValue = NonNullable<ConsolidationTransportMode>;

const TRANSPORT_MODES: TransportModeValue[] = ['ROAD', 'AIR', 'RAIL', 'SEA'];

const headerSchema = z.object({
  transportMode: z.enum(['ROAD', 'AIR', 'RAIL', 'SEA']).nullable().optional(),
  carrier: z.string().trim().optional(),
  trackingNumber: z.string().trim().optional(),
  origin: z.string().trim().optional(),
  destination: z.string().trim().optional(),
  notes: z.string().trim().optional(),
});

type HeaderFormValues = z.infer<typeof headerSchema>;

interface ConsolidationHeaderFormProps {
  companyId: string;
  consolidation: Consolidation;
  editable: boolean;
}

export function ConsolidationHeaderForm({
  companyId,
  consolidation,
  editable,
}: ConsolidationHeaderFormProps) {
  const { t } = useTranslation('consolidations');
  const { t: tEnums } = useTranslation('enums');
  const { enqueueSnackbar } = useSnackbar();

  const [updateConsolidation, updateState] = useUpdateConsolidationMutation();

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { isDirty },
  } = useForm<HeaderFormValues>({
    resolver: zodResolver(headerSchema),
    defaultValues: {
      transportMode: consolidation.transportMode ?? null,
      carrier: consolidation.carrier ?? '',
      trackingNumber: consolidation.trackingNumber ?? '',
      origin: consolidation.origin ?? '',
      destination: consolidation.destination ?? '',
      notes: consolidation.notes ?? '',
    },
  });

  useEffect(() => {
    reset({
      transportMode: consolidation.transportMode ?? null,
      carrier: consolidation.carrier ?? '',
      trackingNumber: consolidation.trackingNumber ?? '',
      origin: consolidation.origin ?? '',
      destination: consolidation.destination ?? '',
      notes: consolidation.notes ?? '',
    });
  }, [consolidation, reset]);

  async function onSubmit(values: HeaderFormValues) {
    await updateConsolidation({
      companyId,
      consolidationId: consolidation.id,
      transportMode: values.transportMode ?? null,
      carrier: values.carrier?.trim() || null,
      trackingNumber: values.trackingNumber?.trim() || null,
      origin: values.origin?.trim() || null,
      destination: values.destination?.trim() || null,
      notes: values.notes?.trim() || null,
    }).unwrap();

    enqueueSnackbar(t('toast.updated'), { variant: 'success' });
  }

  if (!editable) {
    return (
      <Stack spacing={1}>
        <Box>
          <strong>{t('form.transportMode')}:</strong>{' '}
          {consolidation.transportMode
            ? tEnums(
                `transportMode.${consolidation.transportMode.toLowerCase()}`,
              )
            : '—'}
        </Box>
        <Box>
          <strong>{t('form.carrier')}:</strong> {consolidation.carrier ?? '—'}
        </Box>
        <Box>
          <strong>{t('form.trackingNumber')}:</strong>{' '}
          {consolidation.trackingNumber ?? '—'}
        </Box>
        <Box>
          <strong>{t('form.origin')}:</strong> {consolidation.origin ?? '—'}
        </Box>
        <Box>
          <strong>{t('form.destination')}:</strong>{' '}
          {consolidation.destination ?? '—'}
        </Box>
        <Box>
          <strong>{t('form.notes')}:</strong> {consolidation.notes ?? '—'}
        </Box>
      </Stack>
    );
  }

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)}>
      <ApiErrorAlert error={updateState.error} />
      <Stack spacing={2}>
        <Controller
          name="transportMode"
          control={control}
          render={({ field }) => (
            <FormControl fullWidth>
              <InputLabel id="consolidation-header-transport-mode">
                {t('form.transportMode')}
              </InputLabel>
              <Select
                labelId="consolidation-header-transport-mode"
                label={t('form.transportMode')}
                value={field.value ?? ''}
                onChange={(event) => {
                  const value = event.target.value;
                  field.onChange(
                    value === '' ? null : (value as TransportModeValue),
                  );
                }}
              >
                <MenuItem value="">
                  <em>{t('form.transportModeNone')}</em>
                </MenuItem>
                {TRANSPORT_MODES.map((mode) => (
                  <MenuItem key={mode} value={mode}>
                    {tEnums(`transportMode.${mode.toLowerCase()}`)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
        />
        <TextField
          label={t('form.carrier')}
          {...register('carrier')}
          fullWidth
        />
        <TextField
          label={t('form.trackingNumber')}
          {...register('trackingNumber')}
          fullWidth
        />
        <TextField label={t('form.origin')} {...register('origin')} fullWidth />
        <TextField
          label={t('form.destination')}
          {...register('destination')}
          fullWidth
        />
        <TextField
          label={t('form.notes')}
          {...register('notes')}
          fullWidth
          multiline
          minRows={2}
        />
        <Box>
          <Button
            type="submit"
            variant="contained"
            disabled={!isDirty || updateState.isLoading}
          >
            {t('actions.saveHeader')}
          </Button>
        </Box>
      </Stack>
    </Box>
  );
}
