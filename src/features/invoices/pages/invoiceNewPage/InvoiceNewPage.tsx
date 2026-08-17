import { useEffect, useRef, useState, type SyntheticEvent } from 'react';
import { Link as RouterLink, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
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
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';
import { z } from 'zod';

import { useCreateInvoiceMutation } from '@/api/endpoints/invoicesApi';
import {
  useGetQuoteBillableLinesQuery,
  useGetQuoteQuery,
} from '@/api/endpoints/quotesApi';
import { ApiErrorAlert } from '@/components/ApiErrorAlert';
import { BackLink } from '@/components/BackLink';
import { InvoiceDraftLinesSection } from '@/features/invoices/components/invoiceDraftLinesSection/InvoiceDraftLinesSection';
import {
  billableToDraftLine,
  validateDraftInvoiceLines,
  type DraftInvoiceLine,
} from '@/features/invoices/lib/draftInvoiceLine';
import { useAppSelector } from '@/hooks/useAppSelector';
import { usePermissions } from '@/hooks/usePermissions';
import { PageShell } from '@/layouts/pageShell/PageShell';
import { currencySelectOptions } from '@/lib/currencies';

type FormTab = 'lines' | 'notes';

const headerSchema = z.object({
  number: z.string().trim().min(1),
  currency: z.string().trim().length(3),
  notes: z.string().trim().optional(),
});

type HeaderFormValues = z.infer<typeof headerSchema>;

export function InvoiceNewPage() {
  const { t } = useTranslation('invoices');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { enqueueSnackbar } = useSnackbar();
  const companyId = useAppSelector((state) => state.auth.activeCompanyId);
  const { hasPermission } = usePermissions();

  const initialQuoteId = searchParams.get('quoteId');
  const didPrefillLines = useRef(false);

  const [lines, setLines] = useState<DraftInvoiceLine[]>([]);
  const [linesError, setLinesError] = useState<string | undefined>();
  const [tab, setTab] = useState<FormTab>('lines');

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
  const billableQuery = useGetQuoteBillableLinesQuery(
    { companyId: companyId ?? '', quoteId: initialQuoteId ?? '' },
    { skip: !companyId || !initialQuoteId },
  );

  useEffect(() => {
    const quoteCurrency = prefillQuoteQuery.data?.quote.currency;
    if (quoteCurrency && !currency) {
      setValue('currency', quoteCurrency, { shouldValidate: true });
    }
  }, [prefillQuoteQuery.data?.quote.currency, currency, setValue]);

  useEffect(() => {
    const quote = prefillQuoteQuery.data?.quote;
    const billableLines = billableQuery.data?.lines;
    const requestId = quote?.materialRequest?.id;
    if (
      didPrefillLines.current ||
      !quote ||
      !requestId ||
      !billableLines?.length
    ) {
      return;
    }

    didPrefillLines.current = true;
    setValue('currency', quote.currency, { shouldValidate: true });
    setLines(
      billableLines.map((billable) =>
        billableToDraftLine({
          billable,
          quantity: billable.quantity,
          requestId,
          currency: quote.currency,
          buyerCompanyId: quote.buyerCompany?.id ?? null,
          quoteId: quote.id,
        }),
      ),
    );
  }, [prefillQuoteQuery.data?.quote, billableQuery.data?.lines, setValue]);

  const existingSelectionLineIds = lines.map((line) => line.selectionLineId);

  if (!companyId) {
    return null;
  }

  if (!hasPermission('manageInvoices')) {
    return <Navigate to="/app/invoices" replace />;
  }

  function handleTabChange(_event: SyntheticEvent, value: FormTab) {
    setTab(value);
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
      setTab('lines');
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
                <InputLabel id="invoice-new-currency">
                  {t('form.currency')}
                </InputLabel>
                <Controller
                  name="currency"
                  control={control}
                  render={({ field }) => (
                    <Select
                      labelId="invoice-new-currency"
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

            <Box>
              <Tabs value={tab} onChange={handleTabChange}>
                <Tab label={t('tabs.lines')} value="lines" />
                <Tab label={t('tabs.notes')} value="notes" />
              </Tabs>

              <Box sx={{ pt: 2 }}>
                {tab === 'lines' ? (
                  <InvoiceDraftLinesSection
                    companyId={companyId}
                    currency={currency}
                    lines={lines}
                    onChange={(nextLines) => {
                      setLines(nextLines);
                      if (nextLines.length > 0) {
                        setLinesError(undefined);
                      }
                    }}
                    onAddLine={handleAddLine}
                    existingSelectionLineIds={existingSelectionLineIds}
                    initialQuoteId={initialQuoteId}
                    errorMessage={linesError}
                  />
                ) : (
                  <TextField
                    label={t('form.notes')}
                    fullWidth
                    multiline
                    minRows={6}
                    error={Boolean(errors.notes)}
                    helperText={errors.notes?.message}
                    {...register('notes')}
                  />
                )}
              </Box>
            </Box>

            <Stack direction="row" spacing={2} justifyContent="center">
              <Button
                type="submit"
                variant="contained"
                disabled={createState.isLoading}
              >
                {t('actions.save')}
              </Button>
              <Button
                component={RouterLink}
                to="/app/invoices"
                disabled={createState.isLoading}
              >
                {t('actions.cancel')}
              </Button>
            </Stack>
          </Stack>
        </Box>
      </Stack>
    </PageShell>
  );
}
