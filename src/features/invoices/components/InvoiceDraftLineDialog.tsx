import { useEffect, useMemo, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Typography,
} from '@mui/material';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';

import { useAddInvoiceLineMutation } from '@/api/endpoints/invoicesApi';
import {
  useListQuotesQuery,
  useGetQuoteBillableLinesQuery,
} from '@/api/endpoints/quotesApi';
import { ApiErrorAlert } from '@/components/feedback/apiErrorAlert/ApiErrorAlert';
import { DecimalInput } from '@/components/forms/decimalInput/DecimalInput';
import {
  billableToDraftLine,
  type DraftInvoiceLine,
} from '@/features/invoices/lib/draftInvoiceLine';
import {
  formatInvoiceQuoteOptionLabel,
} from '@/features/invoices/lib/invoiceQuoteOptionLabel';
import { isDecimalLte, isValidDecimal } from '@/lib/decimal';

const INVOICEABLE_QUOTE_STATUSES = new Set([
  'PARTIALLY_ACCEPTED',
  'ACCEPTED',
]);

const formSchema = z.object({
  quoteId: z.string().uuid(),
  selectionLineId: z.string().uuid(),
  quantity: z.string().refine(isValidDecimal, { message: 'Invalid quantity' }),
});

type FormValues = z.infer<typeof formSchema>;

type InvoiceDraftLineDialogBaseProps = {
  open: boolean;
  onClose: () => void;
  companyId: string;
  currency: string;
  existingSelectionLineIds: string[];
  initialQuoteId?: string | null;
  buyerCompanyId?: string | null;
};

type InvoiceDraftLineDialogDraftProps = InvoiceDraftLineDialogBaseProps & {
  mode?: 'draft';
  onAdd: (line: DraftInvoiceLine) => void;
};

type InvoiceDraftLineDialogPersistProps = InvoiceDraftLineDialogBaseProps & {
  mode: 'persist';
  invoiceId: string;
  requestIds?: string[];
  quoteIds?: string[];
  onSuccess?: () => void;
};

export type InvoiceDraftLineDialogProps =
  | InvoiceDraftLineDialogDraftProps
  | InvoiceDraftLineDialogPersistProps;

export function InvoiceDraftLineDialog(props: InvoiceDraftLineDialogProps) {
  const {
    open,
    onClose,
    companyId,
    currency,
    existingSelectionLineIds,
    initialQuoteId,
    buyerCompanyId,
  } = props;
  const isPersist = props.mode === 'persist';
  const { t } = useTranslation('invoices');
  const [quoteId, setQuoteId] = useState(initialQuoteId ?? '');

  const [addLine, addState] = useAddInvoiceLineMutation();

  const quotesQuery = useListQuotesQuery(
    {
      companyId,
      direction: 'outbound',
      currency,
      limit: 100,
      offset: 0,
    },
    { skip: !open || !currency },
  );

  const quotes = useMemo(
    () =>
      (quotesQuery.data?.quotes ?? []).filter(
        (quote) =>
          INVOICEABLE_QUOTE_STATUSES.has(quote.status) &&
          Boolean(quote.materialRequest?.id) &&
          (!buyerCompanyId || quote.buyerCompany?.id === buyerCompanyId),
      ),
    [buyerCompanyId, quotesQuery.data?.quotes],
  );

  const selectedQuote = quotes.find((quote) => quote.id === quoteId);

  const billableQuery = useGetQuoteBillableLinesQuery(
    { companyId, quoteId },
    { skip: !open || !quoteId },
  );

  const selectableLines = useMemo(
    () =>
      (billableQuery.data?.lines ?? []).filter(
        (line) => !existingSelectionLineIds.includes(line.selectionLineId),
      ),
    [billableQuery.data?.lines, existingSelectionLineIds],
  );

  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      quoteId: initialQuoteId ?? '',
      selectionLineId: '',
      quantity: '',
    },
  });

  const selectionLineId = watch('selectionLineId');
  const selectedBillable = selectableLines.find(
    (line) => line.selectionLineId === selectionLineId,
  );

  useEffect(() => {
    if (!open) {
      return;
    }
    const nextQuoteId = initialQuoteId ?? '';
    setQuoteId(nextQuoteId);
    reset({
      quoteId: nextQuoteId,
      selectionLineId: '',
      quantity: '',
    });
  }, [open, initialQuoteId, currency, reset]);

  useEffect(() => {
    if (!open || !quoteId || quotesQuery.isLoading) {
      return;
    }
    if (!quotes.some((quote) => quote.id === quoteId)) {
      setQuoteId('');
      setValue('quoteId', '');
      setValue('selectionLineId', '');
      setValue('quantity', '');
    }
  }, [open, quoteId, quotes, quotesQuery.isLoading, setValue]);

  useEffect(() => {
    if (!open || !selectableLines[0]) {
      return;
    }
    const first = selectableLines[0];
    setValue('selectionLineId', first.selectionLineId);
    setValue('quantity', first.quantity);
  }, [open, selectableLines, setValue]);

  useEffect(() => {
    if (selectedBillable) {
      setValue('quantity', selectedBillable.quantity);
    }
  }, [selectedBillable, setValue]);

  async function onSubmit(values: FormValues) {
    const billable = selectableLines.find(
      (line) => line.selectionLineId === values.selectionLineId,
    );
    const requestId = selectedQuote?.materialRequest?.id;
    if (!billable || !selectedQuote || !requestId) {
      return;
    }
    if (!isDecimalLte(values.quantity, billable.quantity)) {
      return;
    }

    if (isPersist) {
      const nextRequestIds = [
        ...new Set([...(props.requestIds ?? []), requestId]),
      ];
      const nextQuoteIds = [
        ...new Set([...(props.quoteIds ?? []), values.quoteId]),
      ];

      await addLine({
        companyId,
        invoiceId: props.invoiceId,
        requestIds: nextRequestIds,
        quoteIds: nextQuoteIds,
        selectionLineId: values.selectionLineId,
        quantity: values.quantity,
      }).unwrap();

      props.onSuccess?.();
      onClose();
      return;
    }

    props.onAdd(
      billableToDraftLine({
        billable,
        quantity: values.quantity,
        requestId,
        currency: selectedQuote.currency,
        buyerCompanyId: selectedQuote.buyerCompany?.id ?? null,
        quoteId: values.quoteId,
      }),
    );
    onClose();
  }

  const mutationError = isPersist ? addState.error : undefined;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{t('form.addLineTitle')}</DialogTitle>
      <DialogContent>
        <ApiErrorAlert
          error={mutationError ?? quotesQuery.error ?? billableQuery.error}
        />
        <Stack spacing={2} sx={{ pt: 1 }}>
          <Alert severity="info">
            <Typography variant="body2" align="center">
              {t('form.addLineQuotesHint', { currency })}
              {buyerCompanyId ? (
                t('form.addLineQuotesHintSameBuyer')
              ) : null}
            </Typography>
          </Alert>

          <FormControl fullWidth error={Boolean(errors.quoteId)}>
            <InputLabel id="draft-quote-label">{t('create.quote')}</InputLabel>
            <Controller
              name="quoteId"
              control={control}
              render={({ field }) => (
                <Select
                  labelId="draft-quote-label"
                  label={t('create.quote')}
                  value={field.value}
                  onChange={(event) => {
                    const next = event.target.value;
                    field.onChange(next);
                    setQuoteId(next);
                    setValue('selectionLineId', '');
                    setValue('quantity', '');
                  }}
                >
                  {quotes.map((quote) => (
                    <MenuItem key={quote.id} value={quote.id}>
                      {formatInvoiceQuoteOptionLabel(quote)}
                    </MenuItem>
                  ))}
                </Select>
              )}
            />
            {errors.quoteId ? (
              <FormHelperText>{errors.quoteId.message}</FormHelperText>
            ) : null}
            {quotes.length === 0 && !quotesQuery.isLoading ? (
              <FormHelperText>{t('empty.quotesForCurrency')}</FormHelperText>
            ) : null}
          </FormControl>

          <FormControl
            fullWidth
            error={Boolean(errors.selectionLineId)}
            disabled={!quoteId || selectableLines.length === 0}
          >
            <InputLabel id="draft-billable-label">
              {t('form.billableLine')}
            </InputLabel>
            <Controller
              name="selectionLineId"
              control={control}
              render={({ field }) => (
                <Select
                  labelId="draft-billable-label"
                  label={t('form.billableLine')}
                  value={field.value}
                  onChange={field.onChange}
                >
                  {selectableLines.map((line) => (
                    <MenuItem
                      key={line.selectionLineId}
                      value={line.selectionLineId}
                    >
                      {t('form.billableLineOption', {
                        description:
                          line.requestLine?.description?.trim() || '—',
                        remaining: line.remainingQuantity,
                        selected: line.selectionQuantity,
                        invoiced: line.invoicedQuantity,
                      })}
                    </MenuItem>
                  ))}
                </Select>
              )}
            />
            {selectableLines.length === 0 && quoteId ? (
              <FormHelperText>{t('empty.billableLines')}</FormHelperText>
            ) : (
              <FormHelperText>{t('form.addLineBillableHint')}</FormHelperText>
            )}
          </FormControl>

          <Controller
            name="quantity"
            control={control}
            render={({ field }) => (
              <DecimalInput
                label={t('form.quantity')}
                fullWidth
                value={field.value}
                onChange={field.onChange}
                error={Boolean(errors.quantity)}
                helperText={
                  errors.quantity?.message ??
                  (selectedBillable
                    ? t('form.billableQuantityBreakdown', {
                        selected: selectedBillable.selectionQuantity,
                        invoiced: selectedBillable.invoicedQuantity,
                        remaining: selectedBillable.remainingQuantity,
                      })
                    : undefined)
                }
              />
            )}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t('actions.dismiss')}</Button>
        <Button
          variant="contained"
          onClick={() => void handleSubmit(onSubmit)()}
          disabled={!selectedBillable || (isPersist && addState.isLoading)}
        >
          {t('actions.addLine')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
