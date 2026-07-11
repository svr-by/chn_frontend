import { useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Box, Button, Stack, TextField } from '@mui/material';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';
import { z } from 'zod';

import type { ShippingInvoice } from '@/api/generated/models/shippingInvoice';
import { useUpdateShippingInvoiceMutation } from '@/api/endpoints/shippingInvoicesApi';
import { ApiErrorAlert } from '@/components/ApiErrorAlert';

const headerSchema = z.object({
  trackingNumber: z.string().trim().optional(),
  carrier: z.string().trim().optional(),
  notes: z.string().trim().optional(),
});

type HeaderFormValues = z.infer<typeof headerSchema>;

interface ShippingInvoiceHeaderFormProps {
  companyId: string;
  shippingInvoice: ShippingInvoice;
  editable: boolean;
}

export function ShippingInvoiceHeaderForm({
  companyId,
  shippingInvoice,
  editable,
}: ShippingInvoiceHeaderFormProps) {
  const { t } = useTranslation('shipping');
  const { enqueueSnackbar } = useSnackbar();

  const [updateShippingInvoice, updateState] = useUpdateShippingInvoiceMutation();

  const {
    register,
    handleSubmit,
    reset,
    formState: { isDirty },
  } = useForm<HeaderFormValues>({
    resolver: zodResolver(headerSchema),
    defaultValues: {
      trackingNumber: shippingInvoice.trackingNumber ?? '',
      carrier: shippingInvoice.carrier ?? '',
      notes: shippingInvoice.notes ?? '',
    },
  });

  useEffect(() => {
    reset({
      trackingNumber: shippingInvoice.trackingNumber ?? '',
      carrier: shippingInvoice.carrier ?? '',
      notes: shippingInvoice.notes ?? '',
    });
  }, [shippingInvoice, reset]);

  async function onSubmit(values: HeaderFormValues) {
    await updateShippingInvoice({
      companyId,
      shippingInvoiceId: shippingInvoice.id,
      supplierInvoiceId: shippingInvoice.supplierInvoiceId,
      trackingNumber: values.trackingNumber || null,
      carrier: values.carrier || null,
      notes: values.notes || null,
    }).unwrap();

    enqueueSnackbar(t('toast.updated'), { variant: 'success' });
  }

  if (!editable) {
    return (
      <Stack spacing={1}>
        {shippingInvoice.trackingNumber ? (
          <Box>
            <strong>{t('form.trackingNumber')}:</strong>{' '}
            {shippingInvoice.trackingNumber}
          </Box>
        ) : null}
        {shippingInvoice.carrier ? (
          <Box>
            <strong>{t('form.carrier')}:</strong> {shippingInvoice.carrier}
          </Box>
        ) : null}
        {shippingInvoice.notes ? (
          <Box>
            <strong>{t('form.notes')}:</strong> {shippingInvoice.notes}
          </Box>
        ) : null}
      </Stack>
    );
  }

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={2}>
        <ApiErrorAlert error={updateState.error} />
        <TextField
          label={t('form.trackingNumber')}
          fullWidth
          {...register('trackingNumber')}
        />
        <TextField label={t('form.carrier')} fullWidth {...register('carrier')} />
        <TextField
          label={t('form.notes')}
          fullWidth
          multiline
          minRows={2}
          {...register('notes')}
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
