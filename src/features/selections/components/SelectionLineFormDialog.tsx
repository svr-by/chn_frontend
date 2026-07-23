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
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';

import type { QuoteComparisonLine } from '@/api/generated/models/quoteComparisonLine';
import type { SelectionLine } from '@/api/generated/models/selectionLine';
import {
  useAddSelectionLineMutation,
  useUpdateSelectionLineMutation,
} from '@/api/endpoints/selectionsApi';
import { ApiErrorAlert } from '@/components/ApiErrorAlert';
import { DecimalDisplay } from '@/components/DecimalDisplay';
import { DecimalInput } from '@/components/DecimalInput';
import { isDecimalLte, isValidDecimal } from '@/lib/decimal';

export interface SelectableOffer {
  quoteLineId: string;
  quoteId: string;
  supplierName: string;
  requestLineDescription: string;
  maxQuantity: string;
  unitPrice: string;
  currency: string;
}

const SELECTABLE_OFFER_STATUSES = new Set(['SUBMITTED', 'PARTIALLY_ACCEPTED']);

export function buildSelectableOffers(
  comparisonLines: QuoteComparisonLine[],
  existingQuoteLineIds: string[],
): SelectableOffer[] {
  const existing = new Set(existingQuoteLineIds);
  const offers: SelectableOffer[] = [];

  for (const line of comparisonLines) {
    for (const offer of line.offers) {
      if (
        SELECTABLE_OFFER_STATUSES.has(offer.status) &&
        !existing.has(offer.quoteLineId)
      ) {
        offers.push({
          quoteLineId: offer.quoteLineId,
          quoteId: offer.quoteId,
          supplierName: offer.supplierCompany.name,
          requestLineDescription: line.requestLine.description,
          maxQuantity: offer.quantity,
          unitPrice: offer.unitPrice,
          currency: offer.currency,
        });
      }
    }
  }

  return offers;
}

function createLineSchema(maxQuantity: string) {
  return z.object({
    quoteLineId: z.string().uuid(),
    quantity: z
      .string()
      .refine(isValidDecimal, { message: 'Invalid quantity' })
      .refine((value) => isDecimalLte(value, maxQuantity), {
        message: 'Quantity exceeds quote line',
      }),
    notes: z.string().trim().optional(),
  });
}

const editLineSchema = z.object({
  quantity: z.string().refine(isValidDecimal, { message: 'Invalid quantity' }),
  notes: z.string().trim().optional(),
});

type CreateLineFormValues = z.infer<ReturnType<typeof createLineSchema>>;
type EditLineFormValues = z.infer<typeof editLineSchema>;

interface SelectionLineFormDialogProps {
  open: boolean;
  onClose: () => void;
  companyId: string;
  selectionId: string;
  materialRequestId: string;
  selectableOffers: SelectableOffer[];
  line?: SelectionLine | null;
  onSuccess?: () => void;
}

export function SelectionLineFormDialog({
  open,
  onClose,
  companyId,
  selectionId,
  materialRequestId,
  selectableOffers,
  line,
  onSuccess,
}: SelectionLineFormDialogProps) {
  const { t } = useTranslation('selections');
  const isEdit = Boolean(line);

  const [addLine, addState] = useAddSelectionLineMutation();
  const [updateLine, updateState] = useUpdateSelectionLineMutation();

  const maxQuantity =
    line?.quoteLine.quantity ?? selectableOffers[0]?.maxQuantity ?? '0';

  const createSchema = useMemo(
    () => createLineSchema(maxQuantity),
    [maxQuantity],
  );

  const createForm = useForm<CreateLineFormValues>({
    resolver: zodResolver(createSchema),
    defaultValues: {
      quoteLineId: '',
      quantity: '',
      notes: '',
    },
  });

  const editForm = useForm<EditLineFormValues>({
    resolver: zodResolver(
      editLineSchema.refine(
        (values) => isDecimalLte(values.quantity, maxQuantity),
        { message: 'Quantity exceeds quote line', path: ['quantity'] },
      ),
    ),
    defaultValues: {
      quantity: line?.quantity ?? '',
      notes: line?.notes ?? '',
    },
  });

  const selectedQuoteLineId = createForm.watch('quoteLineId');
  const createQuantity = createForm.watch('quantity');
  const editQuantity = editForm.watch('quantity');
  const selectedOffer = selectableOffers.find(
    (offer) => offer.quoteLineId === selectedQuoteLineId,
  );
  const effectiveMaxQuantity = selectedOffer?.maxQuantity ?? maxQuantity;

  useEffect(() => {
    if (!open) {
      return;
    }

    if (isEdit && line) {
      editForm.reset({
        quantity: line.quantity,
        notes: line.notes ?? '',
      });
    } else {
      const firstOffer = selectableOffers[0];
      createForm.reset({
        quoteLineId: firstOffer?.quoteLineId ?? '',
        quantity: firstOffer?.maxQuantity ?? '',
        notes: '',
      });
    }
  }, [open, isEdit, line, selectableOffers, createForm, editForm]);

  useEffect(() => {
    if (!isEdit && selectedOffer) {
      createForm.setValue('quantity', selectedOffer.maxQuantity);
    }
  }, [isEdit, selectedOffer, createForm]);

  async function handleCreateSubmit(values: CreateLineFormValues) {
    const offer = selectableOffers.find(
      (item) => item.quoteLineId === values.quoteLineId,
    );
    if (!offer || !isDecimalLte(values.quantity, offer.maxQuantity)) {
      return;
    }

    await addLine({
      companyId,
      selectionId,
      materialRequestId,
      quoteLineId: values.quoteLineId,
      quantity: values.quantity,
      notes: values.notes || undefined,
    }).unwrap();

    onSuccess?.();
    onClose();
  }

  async function handleEditSubmit(values: EditLineFormValues) {
    if (!line || !isDecimalLte(values.quantity, line.quoteLine.quantity)) {
      return;
    }

    await updateLine({
      companyId,
      selectionId,
      lineId: line.id,
      materialRequestId,
      quantity: values.quantity,
      notes: values.notes || null,
    }).unwrap();

    onSuccess?.();
    onClose();
  }

  const mutationError = isEdit ? updateState.error : addState.error;
  const isLoading = isEdit ? updateState.isLoading : addState.isLoading;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {isEdit ? t('form.editLineTitle') : t('form.addLineTitle')}
      </DialogTitle>
      <DialogContent>
        <ApiErrorAlert error={mutationError} />
        {isEdit && line ? (
          <Box
            component="form"
            id="selection-line-edit-form"
            onSubmit={editForm.handleSubmit(handleEditSubmit)}
            sx={{ pt: 1 }}
          >
            <Stack spacing={2}>
              <TextField
                label={t('form.requestLine')}
                value={line.requestLine?.description ?? '—'}
                fullWidth
                disabled
              />
              <TextField
                label={t('form.supplier')}
                value={line.quote.supplierCompany.name}
                fullWidth
                disabled
              />
              <TextField
                label={t('form.maxQuantity')}
                value={line.quoteLine.quantity}
                fullWidth
                disabled
              />
              <DecimalInput
                label={t('form.quantity')}
                fullWidth
                required
                value={editQuantity}
                onChange={(value) =>
                  editForm.setValue('quantity', value, { shouldValidate: true })
                }
                error={Boolean(editForm.formState.errors.quantity)}
                helperText={editForm.formState.errors.quantity?.message}
              />
              <TextField
                label={t('form.notes')}
                fullWidth
                multiline
                minRows={2}
                {...editForm.register('notes')}
              />
            </Stack>
          </Box>
        ) : selectableOffers.length === 0 ? (
          <Box sx={{ pt: 1 }}>{t('empty.selectableOffers')}</Box>
        ) : (
          <Box
            component="form"
            id="selection-line-create-form"
            onSubmit={createForm.handleSubmit(handleCreateSubmit)}
            sx={{ pt: 1 }}
          >
            <Stack spacing={2}>
              <Controller
                name="quoteLineId"
                control={createForm.control}
                render={({ field, fieldState }) => (
                  <FormControl fullWidth error={Boolean(fieldState.error)}>
                    <InputLabel id="selection-offer-label">
                      {t('form.offer')}
                    </InputLabel>
                    <Select
                      {...field}
                      labelId="selection-offer-label"
                      label={t('form.offer')}
                    >
                      {selectableOffers.map((offer) => (
                        <MenuItem
                          key={offer.quoteLineId}
                          value={offer.quoteLineId}
                        >
                          {t('form.offerOption', {
                            description: offer.requestLineDescription,
                            supplier: offer.supplierName,
                            price: offer.unitPrice,
                            currency: offer.currency,
                            max: offer.maxQuantity,
                          })}
                        </MenuItem>
                      ))}
                    </Select>
                    {fieldState.error ? (
                      <FormHelperText>
                        {fieldState.error.message}
                      </FormHelperText>
                    ) : null}
                  </FormControl>
                )}
              />
              {selectedOffer ? (
                <Box>
                  <strong>{t('form.maxQuantity')}:</strong>{' '}
                  <DecimalDisplay value={effectiveMaxQuantity} />
                </Box>
              ) : null}
              <DecimalInput
                label={t('form.quantity')}
                fullWidth
                required
                value={createQuantity}
                onChange={(value) =>
                  createForm.setValue('quantity', value, {
                    shouldValidate: true,
                  })
                }
                error={Boolean(createForm.formState.errors.quantity)}
                helperText={createForm.formState.errors.quantity?.message}
              />
              <TextField
                label={t('form.notes')}
                fullWidth
                multiline
                minRows={2}
                {...createForm.register('notes')}
              />
            </Stack>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t('actions.dismiss')}</Button>
        {isEdit || selectableOffers.length > 0 ? (
          <Button
            type="submit"
            form={
              isEdit ? 'selection-line-edit-form' : 'selection-line-create-form'
            }
            variant="contained"
            disabled={isLoading}
          >
            {t('actions.save')}
          </Button>
        ) : null}
      </DialogActions>
    </Dialog>
  );
}
