import { useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Box, Button, Stack, TextField } from '@mui/material';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';
import { z } from 'zod';

import type { SupplierQuote } from '@/api/generated/models/supplierQuote';
import { useUpdateQuoteMutation } from '@/api/endpoints/quotesApi';
import { ApiErrorAlert } from '@/components/ApiErrorAlert';

const headerSchema = z.object({
  currency: z.string().trim().length(3),
  validUntil: z.string().trim().optional(),
  notes: z.string().trim().optional(),
});

type HeaderFormValues = z.infer<typeof headerSchema>;

interface QuoteHeaderFormProps {
  companyId: string;
  quote: SupplierQuote;
  editable: boolean;
}

export function QuoteHeaderForm({
  companyId,
  quote,
  editable,
}: QuoteHeaderFormProps) {
  const { t } = useTranslation('quotes');
  const { enqueueSnackbar } = useSnackbar();

  const [updateQuote, updateState] = useUpdateQuoteMutation();

  const {
    register,
    handleSubmit,
    reset,
    formState: { isDirty },
  } = useForm<HeaderFormValues>({
    resolver: zodResolver(headerSchema),
    defaultValues: {
      currency: quote.currency,
      validUntil: quote.validUntil ?? '',
      notes: quote.notes ?? '',
    },
  });

  useEffect(() => {
    reset({
      currency: quote.currency,
      validUntil: quote.validUntil ?? '',
      notes: quote.notes ?? '',
    });
  }, [quote, reset]);

  async function onSubmit(values: HeaderFormValues) {
    await updateQuote({
      companyId,
      quoteId: quote.id,
      materialRequestId: quote.materialRequestId,
      currency: values.currency,
      validUntil: values.validUntil || null,
      notes: values.notes || null,
    }).unwrap();

    enqueueSnackbar(t('toast.updated'), { variant: 'success' });
  }

  if (!editable) {
    return (
      <Stack spacing={1}>
        <Box>
          <strong>{t('form.currency')}:</strong> {quote.currency}
        </Box>
        {quote.validUntil ? (
          <Box>
            <strong>{t('form.validUntil')}:</strong>{' '}
            {new Date(quote.validUntil).toLocaleString()}
          </Box>
        ) : null}
        {quote.notes ? (
          <Box>
            <strong>{t('form.notes')}:</strong> {quote.notes}
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
          label={t('form.currency')}
          fullWidth
          required
          inputProps={{ maxLength: 3 }}
          {...register('currency')}
        />
        <TextField
          label={t('form.validUntil')}
          fullWidth
          type="datetime-local"
          InputLabelProps={{ shrink: true }}
          {...register('validUntil')}
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
