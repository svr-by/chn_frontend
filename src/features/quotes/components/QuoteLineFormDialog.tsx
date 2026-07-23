import { useEffect, useMemo } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';

import type { QuoteLine } from '@/api/generated/models/quoteLine';
import type { RequestLine } from '@/api/generated/models/requestLine';
import {
  useAddQuoteLineMutation,
  useUpdateQuoteLineMutation,
} from '@/api/endpoints/quotesApi';
import { ApiErrorAlert } from '@/components/ApiErrorAlert';
import { DecimalInput } from '@/components/DecimalInput';
import { isValidDecimal } from '@/lib/decimal';

const lineSchema = z.object({
  requestLineId: z.string().uuid(),
  quantity: z.string().refine(isValidDecimal, {
    message: 'Invalid quantity',
  }),
  unitPrice: z.string().refine(isValidDecimal, {
    message: 'Invalid unit price',
  }),
  notes: z.string().trim().optional(),
});

type LineFormValues = z.infer<typeof lineSchema>;

interface QuoteLineFormDialogProps {
  open: boolean;
  onClose: () => void;
  companyId: string;
  quoteId: string;
  materialRequestId: string;
  requestLines: RequestLine[];
  existingLineIds: string[];
  line?: QuoteLine | null;
  initialRequestLineId?: string | null;
  onSuccess?: () => void;
}

export function QuoteLineFormDialog({
  open,
  onClose,
  companyId,
  quoteId,
  materialRequestId,
  requestLines,
  existingLineIds,
  line,
  initialRequestLineId,
  onSuccess,
}: QuoteLineFormDialogProps) {
  const { t } = useTranslation('quotes');
  const isEdit = Boolean(line);

  const [addLine, addState] = useAddQuoteLineMutation();
  const [updateLine, updateState] = useUpdateQuoteLineMutation();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    control,
    formState: { errors },
  } = useForm<LineFormValues>({
    resolver: zodResolver(lineSchema),
    defaultValues: {
      requestLineId: '',
      quantity: '',
      unitPrice: '',
      notes: '',
    },
  });

  const quantity = watch('quantity');
  const unitPrice = watch('unitPrice');
  const selectedRequestLineId = watch('requestLineId');

  const availableRequestLines = useMemo(
    () =>
      requestLines.filter((requestLine) =>
        isEdit
          ? requestLine.id === line?.requestLineId ||
            !existingLineIds.includes(requestLine.id)
          : !existingLineIds.includes(requestLine.id),
      ),
    [existingLineIds, isEdit, line?.requestLineId, requestLines],
  );

  useEffect(() => {
    if (!open) {
      return;
    }

    const preferredRequestLineId =
      line?.requestLineId ??
      (initialRequestLineId &&
      availableRequestLines.some((item) => item.id === initialRequestLineId)
        ? initialRequestLineId
        : availableRequestLines[0]?.id) ??
      '';

    const preferredRequestLine = requestLines.find(
      (item) => item.id === preferredRequestLineId,
    );

    reset({
      requestLineId: preferredRequestLineId,
      quantity: line?.quantity ?? preferredRequestLine?.quantity ?? '',
      unitPrice: line?.unitPrice ?? '',
      notes: line?.notes ?? '',
    });
  }, [
    open,
    line,
    initialRequestLineId,
    availableRequestLines,
    requestLines,
    reset,
  ]);

  useEffect(() => {
    if (!selectedRequestLineId || isEdit) {
      return;
    }

    const requestLine = requestLines.find(
      (item) => item.id === selectedRequestLineId,
    );
    if (requestLine) {
      setValue('quantity', requestLine.quantity, { shouldValidate: true });
    }
  }, [selectedRequestLineId, requestLines, isEdit, setValue]);

  const pageError = addState.error ?? updateState.error;
  const isSubmitting = addState.isLoading || updateState.isLoading;

  async function onSubmit(values: LineFormValues) {
    const mutationArgs = {
      companyId,
      quoteId,
      materialRequestId,
      requestLineId: values.requestLineId,
      quantity: values.quantity,
      unitPrice: values.unitPrice,
      notes: values.notes || undefined,
    };

    if (isEdit && line) {
      await updateLine({
        companyId,
        quoteId,
        lineId: line.id,
        materialRequestId,
        quantity: values.quantity,
        unitPrice: values.unitPrice,
        notes: values.notes || null,
      }).unwrap();
    } else {
      await addLine(mutationArgs).unwrap();
    }

    onSuccess?.();
    onClose();
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        {isEdit ? t('form.editLineTitle') : t('form.addLineTitle')}
      </DialogTitle>
      <Box component="form" onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          <ApiErrorAlert error={pageError} />
          <Stack spacing={2}>
            <FormControl fullWidth required>
              <InputLabel id="quote-request-line-label">
                {t('form.requestLine')}
              </InputLabel>
              <Controller
                name="requestLineId"
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    labelId="quote-request-line-label"
                    label={t('form.requestLine')}
                    disabled={isEdit}
                  >
                    {availableRequestLines.map((requestLine) => (
                      <MenuItem key={requestLine.id} value={requestLine.id}>
                        #{requestLine.lineNumber} — {requestLine.description}
                      </MenuItem>
                    ))}
                  </Select>
                )}
              />
            </FormControl>
            <DecimalInput
              label={t('form.quantity')}
              fullWidth
              required
              value={quantity}
              onChange={(value) =>
                setValue('quantity', value, { shouldValidate: true })
              }
              error={Boolean(errors.quantity)}
              helperText={errors.quantity?.message}
            />
            <DecimalInput
              label={t('form.unitPrice')}
              fullWidth
              required
              value={unitPrice}
              onChange={(value) =>
                setValue('unitPrice', value, { shouldValidate: true })
              }
              error={Boolean(errors.unitPrice)}
              helperText={errors.unitPrice?.message}
            />
            <TextField
              label={t('form.notes')}
              fullWidth
              multiline
              minRows={2}
              {...register('notes')}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={isSubmitting}>
            {t('actions.cancel')}
          </Button>
          <Button type="submit" variant="contained" disabled={isSubmitting}>
            {isEdit ? t('actions.save') : t('actions.addLine')}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
