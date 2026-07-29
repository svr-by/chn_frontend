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

import type { BillableLine } from '@/api/generated/models/billableLine';
import type { InvoiceLine } from '@/api/generated/models/invoiceLine';
import {
  useAddInvoiceLineMutation,
  useUpdateInvoiceLineMutation,
} from '@/api/endpoints/invoicesApi';
import { ApiErrorAlert } from '@/components/ApiErrorAlert';
import { DecimalDisplay } from '@/components/DecimalDisplay';
import { DecimalInput } from '@/components/DecimalInput';
import { isDecimalLte, isValidDecimal } from '@/lib/decimal';

function createLineSchema(maxQuantity: string) {
  return z.object({
    selectionLineId: z.string().uuid(),
    quantity: z
      .string()
      .refine(isValidDecimal, { message: 'Invalid quantity' })
      .refine((value) => isDecimalLte(value, maxQuantity), {
        message: 'Quantity exceeds billable',
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

interface InvoiceLineFormDialogProps {
  open: boolean;
  onClose: () => void;
  companyId: string;
  invoiceId: string;
  materialRequestId: string;
  quoteId?: string;
  billableLines: BillableLine[];
  existingSelectionLineIds: string[];
  line?: InvoiceLine | null;
  onSuccess?: () => void;
}

export function InvoiceLineFormDialog({
  open,
  onClose,
  companyId,
  invoiceId,
  materialRequestId,
  quoteId,
  billableLines,
  existingSelectionLineIds,
  line,
  onSuccess,
}: InvoiceLineFormDialogProps) {
  const { t } = useTranslation('invoices');
  const isEdit = Boolean(line);

  const [addLine, addState] = useAddInvoiceLineMutation();
  const [updateLine, updateState] = useUpdateInvoiceLineMutation();

  const selectableLines = useMemo(
    () =>
      billableLines.filter(
        (item) => !existingSelectionLineIds.includes(item.selectionLineId),
      ),
    [billableLines, existingSelectionLineIds],
  );

  const maxQuantity =
    isEdit && line
      ? (billableLines.find(
          (item) => item.selectionLineId === line.selectionLine?.id,
        )?.quantity ?? line.quantity)
      : (selectableLines[0]?.quantity ?? '0');

  const createSchema = useMemo(
    () => createLineSchema(maxQuantity),
    [maxQuantity],
  );

  const createForm = useForm<CreateLineFormValues>({
    resolver: zodResolver(createSchema),
    defaultValues: {
      selectionLineId: '',
      quantity: '',
      notes: '',
    },
  });

  const editForm = useForm<EditLineFormValues>({
    resolver: zodResolver(
      editLineSchema.refine(
        (values) => isDecimalLte(values.quantity, maxQuantity),
        { message: 'Quantity exceeds billable', path: ['quantity'] },
      ),
    ),
    defaultValues: {
      quantity: line?.quantity ?? '',
      notes: line?.notes ?? '',
    },
  });

  const selectedSelectionLineId = createForm.watch('selectionLineId');
  const createQuantity = createForm.watch('quantity');
  const editQuantity = editForm.watch('quantity');
  const selectedBillable = selectableLines.find(
    (item) => item.selectionLineId === selectedSelectionLineId,
  );
  const effectiveMaxQuantity = selectedBillable?.quantity ?? maxQuantity;

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
        selectionLineId: first?.selectionLineId ?? '',
        quantity: first?.quantity ?? '',
        notes: '',
      });
    }
  }, [open, isEdit, line, selectableLines, createForm, editForm]);

  useEffect(() => {
    if (!isEdit && selectedBillable) {
      createForm.setValue('quantity', selectedBillable.quantity);
    }
  }, [isEdit, selectedBillable, createForm]);

  async function handleCreateSubmit(values: CreateLineFormValues) {
    const billable = selectableLines.find(
      (item) => item.selectionLineId === values.selectionLineId,
    );
    if (!billable || !isDecimalLte(values.quantity, billable.quantity)) {
      return;
    }

    await addLine({
      companyId,
      invoiceId,
      materialRequestId,
      quoteId,
      selectionLineId: values.selectionLineId,
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

    const billableMax =
      billableLines.find(
        (item) => item.selectionLineId === line.selectionLine?.id,
      )?.quantity ?? line.quantity;

    if (!isDecimalLte(values.quantity, billableMax)) {
      return;
    }

    await updateLine({
      companyId,
      invoiceId,
      lineId: line.id,
      materialRequestId,
      quoteId,
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
            id="invoice-line-edit-form"
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
                label={t('form.maxQuantity')}
                value={maxQuantity}
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
          <Box sx={{ pt: 1 }}>{t('empty.billableLines')}</Box>
        ) : (
          <Box
            component="form"
            id="invoice-line-create-form"
            onSubmit={createForm.handleSubmit(handleCreateSubmit)}
            sx={{ pt: 1 }}
          >
            <Stack spacing={2}>
              <Controller
                name="selectionLineId"
                control={createForm.control}
                render={({ field, fieldState }) => (
                  <FormControl fullWidth error={Boolean(fieldState.error)}>
                    <InputLabel id="invoice-billable-label">
                      {t('form.billableLine')}
                    </InputLabel>
                    <Select
                      {...field}
                      labelId="invoice-billable-label"
                      label={t('form.billableLine')}
                    >
                      {selectableLines.map((billable) => (
                        <MenuItem
                          key={billable.selectionLineId}
                          value={billable.selectionLineId}
                        >
                          {t('form.billableLineOption', {
                            description:
                              billable.requestLine?.description ?? '—',
                            quantity: billable.quantity,
                            price: billable.unitPrice,
                            total: billable.lineTotal,
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
              {selectedBillable ? (
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
        {isEdit || selectableLines.length > 0 ? (
          <Button
            type="submit"
            form={
              isEdit ? 'invoice-line-edit-form' : 'invoice-line-create-form'
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
