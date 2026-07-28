import { useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Box, Button, Stack, TextField } from '@mui/material';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';
import { z } from 'zod';

import type { SupplierInvoice } from '@/api/generated/models/supplierInvoice';
import { useUpdateInvoiceMutation } from '@/api/endpoints/invoicesApi';
import { ApiErrorAlert } from '@/components/ApiErrorAlert';

const headerSchema = z.object({
  invoiceNumber: z.string().trim().optional(),
  notes: z.string().trim().optional(),
});

type HeaderFormValues = z.infer<typeof headerSchema>;

interface InvoiceHeaderFormProps {
  companyId: string;
  invoice: SupplierInvoice;
  editable: boolean;
}

export function InvoiceHeaderForm({
  companyId,
  invoice,
  editable,
}: InvoiceHeaderFormProps) {
  const { t } = useTranslation('invoices');
  const { enqueueSnackbar } = useSnackbar();

  const [updateInvoice, updateState] = useUpdateInvoiceMutation();

  const {
    register,
    handleSubmit,
    reset,
    formState: { isDirty },
  } = useForm<HeaderFormValues>({
    resolver: zodResolver(headerSchema),
    defaultValues: {
      invoiceNumber: invoice.invoiceNumber ?? '',
      notes: invoice.notes ?? '',
    },
  });

  useEffect(() => {
    reset({
      invoiceNumber: invoice.invoiceNumber ?? '',
      notes: invoice.notes ?? '',
    });
  }, [invoice, reset]);

  async function onSubmit(values: HeaderFormValues) {
    await updateInvoice({
      companyId,
      invoiceId: invoice.id,
      materialRequestId: invoice.materialRequest?.id,
      purchaseSelectionId: invoice.purchaseSelectionId,
      invoiceNumber: values.invoiceNumber || null,
      notes: values.notes || null,
    }).unwrap();

    enqueueSnackbar(t('toast.updated'), { variant: 'success' });
  }

  if (!editable) {
    return (
      <Stack spacing={1}>
        {invoice.invoiceNumber ? (
          <Box>
            <strong>{t('form.invoiceNumber')}:</strong> {invoice.invoiceNumber}
          </Box>
        ) : null}
        {invoice.notes ? (
          <Box>
            <strong>{t('form.notes')}:</strong> {invoice.notes}
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
          label={t('form.invoiceNumber')}
          fullWidth
          {...register('invoiceNumber')}
        />
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
