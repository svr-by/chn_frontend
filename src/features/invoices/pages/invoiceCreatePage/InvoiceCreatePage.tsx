import { useEffect, useMemo, useState } from 'react';
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Box,
  Button,
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';
import { z } from 'zod';

import { useCreateInvoiceMutation } from '@/api/endpoints/invoicesApi';
import { useGetQuoteQuery } from '@/api/endpoints/quotesApi';
import { ApiErrorAlert } from '@/components/ApiErrorAlert';
import { BackLink } from '@/components/BackLink';
import { DecimalDisplay } from '@/components/DecimalDisplay';
import { InvoiceDraftLineDialog } from '@/features/invoices/components/InvoiceDraftLineDialog';
import {
  groupDraftLinesByRequest,
  validateDraftInvoiceLines,
  type DraftInvoiceLine,
} from '@/features/invoices/lib/draftInvoiceLine';
import { useAppSelector } from '@/hooks/useAppSelector';
import { usePermissions } from '@/hooks/usePermissions';
import { PageShell } from '@/layouts/pageShell/PageShell';
import { currencySelectOptions } from '@/lib/currencies';

const headerSchema = z.object({
  number: z.string().trim().min(1),
  currency: z.string().trim().length(3),
  notes: z.string().trim().optional(),
});

type HeaderFormValues = z.infer<typeof headerSchema>;

export function InvoiceCreatePage() {
  const { t } = useTranslation('invoices');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { enqueueSnackbar } = useSnackbar();
  const companyId = useAppSelector((state) => state.auth.activeCompanyId);
  const { hasPermission } = usePermissions();

  const initialQuoteId = searchParams.get('quoteId');

  const [lines, setLines] = useState<DraftInvoiceLine[]>([]);
  const [linesError, setLinesError] = useState<string | undefined>();
  const [dialogOpen, setDialogOpen] = useState(false);

  const [createInvoice, createState] = useCreateInvoiceMutation();

  const {
    control,
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<HeaderFormValues>({
    resolver: zodResolver(headerSchema),
    defaultValues: {
      number: '',
      currency: '',
      notes: '',
    },
  });

  const currency = watch('currency');
  const currencyOptions = currencySelectOptions(currency);

  const prefillQuoteQuery = useGetQuoteQuery(
    { companyId: companyId ?? '', quoteId: initialQuoteId ?? '' },
    { skip: !companyId || !initialQuoteId },
  );

  useEffect(() => {
    const quoteCurrency = prefillQuoteQuery.data?.quote.currency;
    if (quoteCurrency && !currency) {
      setValue('currency', quoteCurrency, { shouldValidate: true });
    }
  }, [prefillQuoteQuery.data?.quote.currency, currency, setValue]);

  const groupedLines = useMemo(() => groupDraftLinesByRequest(lines), [lines]);
  const existingSelectionLineIds = lines.map((line) => line.selectionLineId);

  if (!companyId) {
    return null;
  }

  if (!hasPermission('manageInvoices')) {
    return <Navigate to="/app/invoices" replace />;
  }

  function handleCurrencyChange(next: string) {
    if (next !== currency && lines.length > 0) {
      setLines([]);
      enqueueSnackbar(t('toast.currencyClearedLines'), { variant: 'info' });
    }
    setValue('currency', next, { shouldValidate: true });
  }

  function handleAddLine(line: DraftInvoiceLine) {
    if (currency && line.currency !== currency) {
      enqueueSnackbar(t('toast.mixedCurrency'), { variant: 'warning' });
      return;
    }

    setLines((prev) => {
      const next = [...prev, line];
      const validation = validateDraftInvoiceLines(next);
      if (!validation.ok && validation.reason === 'mixedBuyer') {
        enqueueSnackbar(t('toast.mixedBuyer'), { variant: 'warning' });
        return prev;
      }
      if (!validation.ok && validation.reason === 'mixedCurrency') {
        enqueueSnackbar(t('toast.mixedCurrency'), { variant: 'warning' });
        return prev;
      }
      setLinesError(undefined);
      return next;
    });
  }

  function handleRemoveLine(selectionLineId: string) {
    setLines((prev) =>
      prev.filter((line) => line.selectionLineId !== selectionLineId),
    );
  }

  async function onSubmit(values: HeaderFormValues) {
    if (!companyId) {
      return;
    }

    const validation = validateDraftInvoiceLines(lines);
    if (!validation.ok) {
      setLinesError(
        validation.reason === 'empty'
          ? t('validation.minLines')
          : t('toast.linesInvalid'),
      );
      return;
    }

    const quoteIds = [...new Set(lines.map((line) => line.quoteId))];
    const requestIds = [...new Set(lines.map((line) => line.requestId))];

    const created = await createInvoice({
      companyId,
      number: values.number,
      currency: values.currency,
      notes: values.notes || undefined,
      lines: lines.map((line) => ({
        selectionLineId: line.selectionLineId,
        quantity: line.quantity,
      })),
      quoteIds,
      requestIds,
    }).unwrap();

    enqueueSnackbar(t('toast.created'), { variant: 'success' });
    navigate(`/app/invoices/${created.invoice.id}`);
  }

  return (
    <PageShell maxWidth="md">
      <Stack spacing={3}>
        <Stack spacing={1}>
          <BackLink to="/app/invoices" />
          <Typography variant="h5" component="h1">
            {t('create.title')}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t('create.subtitle')}
          </Typography>
        </Stack>

        <ApiErrorAlert error={createState.error} />

        <Box component="form" onSubmit={handleSubmit(onSubmit)}>
          <Stack spacing={3}>
            <Stack spacing={2} direction={{ xs: 'column', sm: 'row' }}>
              <TextField
                label={t('form.invoiceNumber')}
                fullWidth
                required
                error={Boolean(errors.number)}
                helperText={errors.number?.message}
                {...register('number')}
              />
              <FormControl
                fullWidth
                required
                error={Boolean(errors.currency)}
                sx={{ minWidth: { sm: 160 }, maxWidth: { sm: 200 } }}
              >
                <InputLabel id="invoice-create-currency">
                  {t('form.currency')}
                </InputLabel>
                <Controller
                  name="currency"
                  control={control}
                  render={({ field }) => (
                    <Select
                      labelId="invoice-create-currency"
                      label={t('form.currency')}
                      value={field.value}
                      onChange={(event) =>
                        handleCurrencyChange(event.target.value)
                      }
                    >
                      {currencyOptions.map((code) => (
                        <MenuItem key={code} value={code}>
                          {code}
                        </MenuItem>
                      ))}
                    </Select>
                  )}
                />
                {errors.currency ? (
                  <FormHelperText>{errors.currency.message}</FormHelperText>
                ) : null}
              </FormControl>
            </Stack>
            <TextField
              label={t('form.notes')}
              fullWidth
              multiline
              minRows={2}
              {...register('notes')}
            />

            <Stack spacing={1.5}>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography variant="h6">{t('linesTitle')}</Typography>
                <Button
                  variant="outlined"
                  onClick={() => setDialogOpen(true)}
                  disabled={!currency}
                >
                  {t('actions.addLine')}
                </Button>
              </Stack>

              {linesError ? (
                <Typography color="error" variant="body2">
                  {linesError}
                </Typography>
              ) : null}

              {lines.length === 0 ? (
                <Typography color="text.secondary">{t('empty.lines')}</Typography>
              ) : (
                <Stack spacing={2}>
                  {groupedLines.map(([requestId, requestLines]) => (
                    <Stack key={requestId} spacing={1}>
                      <Typography variant="subtitle2" color="text.secondary">
                        {t('detail.requestGroup', {
                          id: requestId.slice(0, 8),
                        })}
                      </Typography>
                      {requestLines.map((line) => (
                        <Stack
                          key={line.selectionLineId}
                          direction={{ xs: 'column', sm: 'row' }}
                          spacing={1}
                          justifyContent="space-between"
                          alignItems={{ xs: 'flex-start', sm: 'center' }}
                          sx={{
                            borderBottom: 1,
                            borderColor: 'divider',
                            py: 1,
                          }}
                        >
                          <Box>
                            <Typography variant="body2">
                              {line.description}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              <DecimalDisplay value={line.quantity} /> ×{' '}
                              <DecimalDisplay value={line.unitPrice} />{' '}
                              {line.currency}
                            </Typography>
                          </Box>
                          <Button
                            size="small"
                            color="error"
                            onClick={() =>
                              handleRemoveLine(line.selectionLineId)
                            }
                          >
                            {t('actions.deleteLine')}
                          </Button>
                        </Stack>
                      ))}
                    </Stack>
                  ))}
                </Stack>
              )}
            </Stack>

            <Stack direction="row" spacing={1} justifyContent="flex-end">
              <Button
                onClick={() => navigate('/app/invoices')}
                disabled={createState.isLoading}
              >
                {t('actions.cancel')}
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={createState.isLoading}
              >
                {t('actions.save')}
              </Button>
            </Stack>
          </Stack>
        </Box>
      </Stack>

      {currency ? (
        <InvoiceDraftLineDialog
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          companyId={companyId}
          currency={currency}
          existingSelectionLineIds={existingSelectionLineIds}
          initialQuoteId={initialQuoteId}
          onAdd={handleAddLine}
        />
      ) : null}
    </PageShell>
  );
}
