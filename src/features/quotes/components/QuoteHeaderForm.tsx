import { useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Box, Button, Stack, TextField } from '@mui/material';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
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

function toDateTimeLocalValue(iso: string | null | undefined): string {
  if (!iso) {
    return '';
  }
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return '';
  }
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60_000);
  return local.toISOString().slice(0, 16);
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
      validUntil: toDateTimeLocalValue(quote.validUntil),
      notes: quote.notes ?? '',
    },
  });

  useEffect(() => {
    reset({
      currency: quote.currency,
      validUntil: toDateTimeLocalValue(quote.validUntil),
      notes: quote.notes ?? '',
    });
  }, [quote, reset]);

  async function onSubmit(values: HeaderFormValues) {
    await updateQuote({
      companyId,
      quoteId: quote.id,
      materialRequestId: quote.materialRequestId,
      currency: values.currency,
      validUntil: values.validUntil
        ? new Date(values.validUntil).toISOString()
        : null,
      notes: values.notes || null,
    }).unwrap();

    enqueueSnackbar(t('toast.updated'), { variant: 'success' });
  }

  if (!editable) {
    return (
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        flexWrap="wrap"
        useFlexGap
      >
        <Box>
          <strong>{t('form.currency')}:</strong> {quote.currency}
        </Box>
        {quote.validUntil ? (
          <Box>
            <strong>{t('form.validUntil')}:</strong>{' '}
            {new Date(quote.validUntil).toLocaleDateString()}
          </Box>
        ) : null}
        {quote.notes ? (
          <Box sx={{ flexBasis: '100%' }}>
            <strong>{t('form.notes')}:</strong> {quote.notes}
          </Box>
        ) : null}
      </Stack>
    );
  }

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)}>
      <ApiErrorAlert error={updateState.error} />
      <Stack spacing={1.5}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={1.5}
          alignItems={{ sm: 'flex-start' }}
        >
          <TextField
            label={t('form.currency')}
            required
            inputProps={{ maxLength: 3 }}
            sx={{ width: { xs: '100%', sm: 120 } }}
            {...register('currency')}
          />
          <TextField
            label={t('form.validUntil')}
            type="datetime-local"
            InputLabelProps={{ shrink: true }}
            sx={{ width: { xs: '100%', sm: 240 } }}
            {...register('validUntil')}
          />
          <Button
            type="submit"
            variant="outlined"
            startIcon={<SaveOutlinedIcon />}
            disabled={!isDirty || updateState.isLoading}
            sx={{ mt: { sm: 1 }, flexShrink: 0 }}
          >
            {t('actions.saveHeader')}
          </Button>
        </Stack>
        <TextField
          label={t('form.notes')}
          fullWidth
          multiline
          minRows={2}
          {...register('notes')}
        />
      </Stack>
    </Box>
  );
}
