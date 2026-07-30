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

import type { ShippableLine } from '@/api/generated/models/shippableLine';
import type { ShippingLine } from '@/api/generated/models/shippingLine';
import {
  useAddShippingLineMutation,
  useUpdateShippingLineMutation,
} from '@/api/endpoints/shippingInvoicesApi';
import { ApiErrorAlert } from '@/components/ApiErrorAlert';
import { DecimalDisplay } from '@/components/DecimalDisplay';
import { DecimalInput } from '@/components/DecimalInput';
import { RequestLineCancelledBadge } from '@/components/RequestLineCancelledBadge';
import { isDecimalLte, isValidDecimal, parseDecimal } from '@/lib/decimal';

function createLineSchema(maxQuantity: string) {
  return z.object({
    invoiceLineId: z.string().uuid(),
    quantity: z
      .string()
      .refine(isValidDecimal, { message: 'Invalid quantity' })
      .refine((value) => isDecimalLte(value, maxQuantity), {
        message: 'Quantity exceeds remaining',
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

interface ShippingInvoiceLineFormDialogProps {
  open: boolean;
  onClose: () => void;
  companyId: string;
  shippingInvoiceId: string;
  supplierInvoiceId: string;
  shippableLines: ShippableLine[];
  existingInvoiceLineIds: string[];
  line?: ShippingLine | null;
  onSuccess?: () => void;
}

export function ShippingInvoiceLineFormDialog({
  open,
  onClose,
  companyId,
  shippingInvoiceId,
  supplierInvoiceId,
  shippableLines,
  existingInvoiceLineIds,
  line,
  onSuccess,
}: ShippingInvoiceLineFormDialogProps) {
  const { t } = useTranslation('shipping');
  const isEdit = Boolean(line);

  const [addLine, addState] = useAddShippingLineMutation();
  const [updateLine, updateState] = useUpdateShippingLineMutation();

  const selectableLines = useMemo(
    () =>
      shippableLines.filter(
        (item) =>
          item.remainingQuantity !== '0' &&
          item.remainingQuantity !== '0.0000' &&
          !existingInvoiceLineIds.includes(item.invoiceLineId),
      ),
    [shippableLines, existingInvoiceLineIds],
  );

  const editMaxQuantity = useMemo(() => {
    if (!isEdit || !line) {
      return '0';
    }

    const shippable = shippableLines.find(
      (item) => item.invoiceLineId === line.invoiceLine?.id,
    );
    if (!shippable) {
      return line.quantity;
    }

    return parseDecimal(shippable.remainingQuantity)
      .plus(parseDecimal(line.quantity))
      .toString();
  }, [isEdit, line, shippableLines]);

  const maxQuantity = isEdit
    ? editMaxQuantity
    : (selectableLines[0]?.remainingQuantity ?? '0');

  const createSchema = useMemo(
    () => createLineSchema(maxQuantity),
    [maxQuantity],
  );

  const createForm = useForm<CreateLineFormValues>({
    resolver: zodResolver(createSchema),
    defaultValues: {
      invoiceLineId: '',
      quantity: '',
      notes: '',
    },
  });

  const editForm = useForm<EditLineFormValues>({
    resolver: zodResolver(
      editLineSchema.refine(
        (values) => isDecimalLte(values.quantity, editMaxQuantity),
        { message: 'Quantity exceeds remaining', path: ['quantity'] },
      ),
    ),
    defaultValues: {
      quantity: line?.quantity ?? '',
      notes: line?.notes ?? '',
    },
  });

  const selectedInvoiceLineId = createForm.watch('invoiceLineId');
  const createQuantity = createForm.watch('quantity');
  const editQuantity = editForm.watch('quantity');
  const selectedShippable = selectableLines.find(
    (item) => item.invoiceLineId === selectedInvoiceLineId,
  );

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
      const first = selectableLines[0];
      createForm.reset({
        invoiceLineId: first?.invoiceLineId ?? '',
        quantity: first?.remainingQuantity ?? '',
        notes: '',
      });
    }
  }, [open, isEdit, line, selectableLines, createForm, editForm]);

  useEffect(() => {
    if (!isEdit && selectedShippable) {
      createForm.setValue('quantity', selectedShippable.remainingQuantity);
    }
  }, [isEdit, selectedShippable, createForm]);

  async function handleCreateSubmit(values: CreateLineFormValues) {
    const shippable = selectableLines.find(
      (item) => item.invoiceLineId === values.invoiceLineId,
    );
    if (
      !shippable ||
      !isDecimalLte(values.quantity, shippable.remainingQuantity)
    ) {
      return;
    }

    await addLine({
      companyId,
      shippingInvoiceId,
      supplierInvoiceId,
      invoiceLineId: values.invoiceLineId,
      quantity: values.quantity,
      notes: values.notes || undefined,
    }).unwrap();

    onSuccess?.();
    onClose();
  }

  async function handleEditSubmit(values: EditLineFormValues) {
    if (!line) {
      return;
    }

    if (!isDecimalLte(values.quantity, editMaxQuantity)) {
      return;
    }

    await updateLine({
      companyId,
      shippingInvoiceId,
      lineId: line.id,
      supplierInvoiceId,
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
            id="shipping-line-edit-form"
            onSubmit={editForm.handleSubmit(handleEditSubmit)}
            sx={{ pt: 1 }}
          >
            <Stack spacing={2}>
              <Stack spacing={1}>
                <TextField
                  label={t('form.requestLine')}
                  value={line.requestLine?.description ?? '—'}
                  fullWidth
                  disabled
                />
                <RequestLineCancelledBadge
                  cancelledAt={line.requestLine?.cancelledAt}
                />
              </Stack>
              <TextField
                label={t('form.maxQuantity')}
                value={editMaxQuantity}
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
        ) : selectableLines.length === 0 ? (
          <Box sx={{ pt: 1 }}>{t('empty.shippableLines')}</Box>
        ) : (
          <Box
            component="form"
            id="shipping-line-create-form"
            onSubmit={createForm.handleSubmit(handleCreateSubmit)}
            sx={{ pt: 1 }}
          >
            <Stack spacing={2}>
              <Controller
                name="invoiceLineId"
                control={createForm.control}
                render={({ field, fieldState }) => (
                  <FormControl fullWidth error={Boolean(fieldState.error)}>
                    <InputLabel id="shipping-shippable-label">
                      {t('form.shippableLine')}
                    </InputLabel>
                    <Select
                      {...field}
                      labelId="shipping-shippable-label"
                      label={t('form.shippableLine')}
                    >
                      {selectableLines.map((shippable) => (
                        <MenuItem
                          key={shippable.invoiceLineId}
                          value={shippable.invoiceLineId}
                        >
                          <Stack
                            direction="row"
                            spacing={1}
                            alignItems="center"
                            flexWrap="wrap"
                          >
                            <span>
                              {t('form.shippableLineOption', {
                                description:
                                  shippable.requestLine?.description ?? '—',
                                remaining: shippable.remainingQuantity,
                                invoice: shippable.invoiceQuantity,
                                shipped: shippable.shippedQuantity,
                              })}
                            </span>
                            <RequestLineCancelledBadge
                              cancelledAt={shippable.requestLine?.cancelledAt}
                            />
                          </Stack>
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
              {selectedShippable ? (
                <Box>
                  <strong>{t('form.remainingQuantity')}:</strong>{' '}
                  <DecimalDisplay value={selectedShippable.remainingQuantity} />
                  {' · '}
                  <strong>{t('form.invoiceQuantity')}:</strong>{' '}
                  <DecimalDisplay value={selectedShippable.invoiceQuantity} />
                  {' · '}
                  <strong>{t('form.shippedQuantity')}:</strong>{' '}
                  <DecimalDisplay value={selectedShippable.shippedQuantity} />
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
        {isEdit || selectableLines.length > 0 ? (
          <Button
            type="submit"
            form={
              isEdit ? 'shipping-line-edit-form' : 'shipping-line-create-form'
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
