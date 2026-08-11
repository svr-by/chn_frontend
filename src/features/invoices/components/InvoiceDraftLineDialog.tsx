import { useEffect, useMemo, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import {
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
} from '@mui/material';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';

import {
  useListQuotesQuery,
  useGetQuoteBillableLinesQuery,
} from '@/api/endpoints/quotesApi';
import { ApiErrorAlert } from '@/components/ApiErrorAlert';
import { DecimalInput } from '@/components/DecimalInput';
import {
  billableToDraftLine,
  type DraftInvoiceLine,
} from '@/features/invoices/lib/draftInvoiceLine';
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

interface InvoiceDraftLineDialogProps {
  open: boolean;
  onClose: () => void;
  companyId: string;
  currency: string;
  existingSelectionLineIds: string[];
  initialQuoteId?: string | null;
  onAdd: (line: DraftInvoiceLine) => void;
}

export function InvoiceDraftLineDialog({
  open,
  onClose,
  companyId,
  currency,
  existingSelectionLineIds,
  initialQuoteId,
  onAdd,
}: InvoiceDraftLineDialogProps) {
  const { t } = useTranslation('invoices');
  const [quoteId, setQuoteId] = useState(initialQuoteId ?? '');

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
          Boolean(quote.materialRequest?.id),
      ),
    [quotesQuery.data?.quotes],
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

  function onSubmit(values: FormValues) {
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

    onAdd(
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

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{t('form.addLineTitle')}</DialogTitle>
      <DialogContent>
        <ApiErrorAlert error={quotesQuery.error ?? billableQuery.error} />
        <Stack spacing={2} sx={{ pt: 1 }}>
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
                      {quote.buyerCompany?.name ?? quote.id.slice(0, 8)}
                      {quote.materialRequest?.title
                        ? ` · ${quote.materialRequest.title}`
                        : ''}{' '}
                      · {quote.status}
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
                        description: line.requestLine?.description ?? '—',
                        quantity: line.quantity,
                        price: line.unitPrice,
                        total: line.lineTotal,
                      })}
                    </MenuItem>
                  ))}
                </Select>
              )}
            />
            {selectableLines.length === 0 && quoteId ? (
              <FormHelperText>{t('empty.billableLines')}</FormHelperText>
            ) : null}
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
                    ? `${t('form.maxQuantity')}: ${selectedBillable.quantity}`
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
          onClick={handleSubmit(onSubmit)}
          disabled={!selectedBillable}
        >
          {t('actions.addLine')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
