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
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';

import type { QuoteLine } from '@/api/generated/models/quoteLine';
import type { QuoteLineInputLeadTimeUnit } from '@/api/generated/models/quoteLineInputLeadTimeUnit';
import type { RequestLine } from '@/api/generated/models/requestLine';
import {
  useAddQuoteLineMutation,
  useUpdateQuoteLineMutation,
} from '@/api/endpoints/quotesApi';
import { ApiErrorAlert } from '@/components/feedback/apiErrorAlert/ApiErrorAlert';
import { DecimalInput } from '@/components/forms/decimalInput/DecimalInput';
import { isValidDecimal } from '@/lib/decimal';
import { MAX_QUOTE_LINE_VARIANTS } from '@/features/quotes/lib/quoteLineVariants';
import enEnums from '@/locales/en/enums.json';

type LeadTimeUnit = Exclude<QuoteLineInputLeadTimeUnit, null>;

const LEAD_TIME_UNITS = (
  Object.keys(enEnums.leadTimeUnit) as Array<keyof typeof enEnums.leadTimeUnit>
).map((key) => key.toUpperCase() as LeadTimeUnit);

const LEAD_TIME_UNIT_ENUM = LEAD_TIME_UNITS as [
  LeadTimeUnit,
  ...LeadTimeUnit[],
];

type LineFormValues = {
  requestLineId: string;
  quantity: string;
  unitPrice: string;
  leadTime: string;
  leadTimeUnit: LeadTimeUnit | '';
  notes?: string;
};

interface QuoteLineFormDialogProps {
  open: boolean;
  onClose: () => void;
  companyId: string;
  quoteId: string;
  materialRequestId?: string;
  currency: string;
  requestLines: RequestLine[];
  quoteLineCountByRequestLineId: Map<string, number>;
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
  currency,
  requestLines,
  quoteLineCountByRequestLineId,
  line,
  initialRequestLineId,
  onSuccess,
}: QuoteLineFormDialogProps) {
  const { t } = useTranslation(['quotes', 'enums']);
  const isEdit = Boolean(line);

  const [addLine, addState] = useAddQuoteLineMutation();
  const [updateLine, updateState] = useUpdateQuoteLineMutation();

  const lineSchema = useMemo(
    () =>
      z
        .object({
          requestLineId: z.string().uuid(),
          quantity: z.string().refine(isValidDecimal, {
            message: 'Invalid quantity',
          }),
          unitPrice: z.string().refine(isValidDecimal, {
            message: 'Invalid unit price',
          }),
          leadTime: z.string().trim(),
          leadTimeUnit: z.union([
            z.enum(LEAD_TIME_UNIT_ENUM),
            z.literal(''),
          ]),
          notes: z.string().trim().optional(),
        })
        .superRefine((values, ctx) => {
          const hasValue = values.leadTime.length > 0;
          const hasUnit = values.leadTimeUnit !== '';

          if (hasValue !== hasUnit) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: t('form.leadTimeHint'),
              path: hasValue ? ['leadTimeUnit'] : ['leadTime'],
            });
            return;
          }

          if (hasValue) {
            const parsed = Number(values.leadTime);
            if (!Number.isInteger(parsed) || parsed <= 0) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: t('form.leadTimeHint'),
                path: ['leadTime'],
              });
            }
          }
        }),
    [t],
  );

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
      leadTime: '',
      leadTimeUnit: '',
      notes: '',
    },
  });

  const quantity = watch('quantity');
  const unitPrice = watch('unitPrice');
  const selectedRequestLineId = watch('requestLineId');

  const selectedRequestLine = useMemo(
    () => requestLines.find((item) => item.id === selectedRequestLineId),
    [requestLines, selectedRequestLineId],
  );

  const availableRequestLines = useMemo(
    () =>
      requestLines.filter((requestLine) => {
        if (isEdit) {
          return requestLine.id === line?.requestLineId;
        }
        const count = quoteLineCountByRequestLineId.get(requestLine.id) ?? 0;
        return count < MAX_QUOTE_LINE_VARIANTS;
      }),
    [isEdit, line?.requestLineId, quoteLineCountByRequestLineId, requestLines],
  );

  useEffect(() => {
    if (!open) {
      return;
    }

    addState.reset();
    updateState.reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- clear stale mutation errors when dialog opens
  }, [open]);

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
      leadTime:
        line?.leadTime != null && line.leadTimeUnit
          ? String(line.leadTime)
          : '1',
      leadTimeUnit: line?.leadTimeUnit ?? 'WEEK',
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
  const isAddingVariant =
    !isEdit &&
    Boolean(initialRequestLineId) &&
    (quoteLineCountByRequestLineId.get(initialRequestLineId ?? '') ?? 0) > 0;

  function handleClose() {
    addState.reset();
    updateState.reset();
    onClose();
  }

  function buildLeadTimePayload(values: LineFormValues) {
    if (!values.leadTime || !values.leadTimeUnit) {
      return { leadTime: null as number | null, leadTimeUnit: null as null };
    }

    return {
      leadTime: Number(values.leadTime),
      leadTimeUnit: values.leadTimeUnit,
    };
  }

  async function onSubmit(values: LineFormValues) {
    const leadTimePayload = buildLeadTimePayload(values);

    if (isEdit && line) {
      await updateLine({
        companyId,
        quoteId,
        lineId: line.id,
        materialRequestId,
        quantity: values.quantity,
        unitPrice: values.unitPrice,
        notes: values.notes || null,
        leadTime: leadTimePayload.leadTime,
        leadTimeUnit: leadTimePayload.leadTimeUnit,
      }).unwrap();
    } else {
      await addLine({
        companyId,
        quoteId,
        materialRequestId,
        requestLineId: values.requestLineId,
        quantity: values.quantity,
        unitPrice: values.unitPrice,
        notes: values.notes || undefined,
        ...(leadTimePayload.leadTime != null && leadTimePayload.leadTimeUnit
          ? {
              leadTime: leadTimePayload.leadTime,
              leadTimeUnit: leadTimePayload.leadTimeUnit,
            }
          : {}),
      }).unwrap();
    }

    onSuccess?.();
    handleClose();
  }

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>
        {isEdit
          ? t('form.editLineTitle')
          : isAddingVariant
            ? t('form.addVariantTitle')
            : t('form.addLineTitle')}
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
                    disabled={isEdit || Boolean(initialRequestLineId)}
                  >
                    {availableRequestLines.map((requestLine) => {
                      const count =
                        quoteLineCountByRequestLineId.get(requestLine.id) ?? 0;
                      return (
                        <MenuItem key={requestLine.id} value={requestLine.id}>
                          #{requestLine.lineNumber} — {requestLine.description}
                          {count > 0
                            ? ` (${t('form.variantCount', {
                                count,
                                max: MAX_QUOTE_LINE_VARIANTS,
                              })})`
                            : ''}
                        </MenuItem>
                      );
                    })}
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
              helperText={
                errors.quantity?.message ??
                (selectedRequestLine
                  ? t('form.requestedQuantityHint', {
                      quantity: selectedRequestLine.quantity,
                    })
                  : undefined)
              }
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
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">{currency}</InputAdornment>
                ),
              }}
            />
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                label={t('form.leadTimeValue')}
                type="number"
                fullWidth
                inputProps={{ min: 1, step: 1 }}
                error={Boolean(errors.leadTime)}
                helperText={errors.leadTime?.message ?? t('form.leadTimeHint')}
                {...register('leadTime')}
              />
              <Controller
                name="leadTimeUnit"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth error={Boolean(errors.leadTimeUnit)}>
                    <InputLabel id="quote-lead-time-unit-label">
                      {t('form.leadTimeUnit')}
                    </InputLabel>
                    <Select
                      {...field}
                      labelId="quote-lead-time-unit-label"
                      label={t('form.leadTimeUnit')}
                    >
                      <MenuItem value="">
                        <em>—</em>
                      </MenuItem>
                      {LEAD_TIME_UNITS.map((unit) => (
                        <MenuItem key={unit} value={unit}>
                          {t(`enums:leadTimeUnit.${unit.toLowerCase()}`)}
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.leadTimeUnit?.message ? (
                      <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
                        {errors.leadTimeUnit.message}
                      </Typography>
                    ) : null}
                  </FormControl>
                )}
              />
            </Stack>
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
          <Button onClick={handleClose} disabled={isSubmitting}>
            {t('actions.cancel')}
          </Button>
          <Button type="submit" variant="contained" disabled={isSubmitting}>
            {isEdit
              ? t('actions.save')
              : isAddingVariant
                ? t('actions.addVariant')
                : t('actions.addLine')}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
