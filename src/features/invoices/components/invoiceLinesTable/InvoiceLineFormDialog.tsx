import { useEffect, useMemo } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
} from '@mui/material';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';

import type { InvoiceLine } from '@/api/generated/models/invoiceLine';
import { useUpdateInvoiceLineMutation } from '@/api/endpoints/invoicesApi';
import { useGetQuoteBillableLinesQuery } from '@/api/endpoints/quotesApi';
import { ApiErrorAlert } from '@/components/ApiErrorAlert';
import { DecimalInput } from '@/components/DecimalInput';
import { RequestLineCancelledBadge } from '@/components/RequestLineCancelledBadge';
import { useSupplierQuoteForRequest } from '@/features/invoices/hooks/useSupplierQuoteForRequest';
import { isDecimalGte, isDecimalLte, isValidDecimal } from '@/lib/decimal';

function createEditLineSchema(maxQuantity: string, minQuantity: string) {
  return z.object({
    quantity: z
      .string()
      .refine(isValidDecimal, { message: 'Invalid quantity' })
      .refine((value) => isDecimalGte(value, minQuantity), {
        message: 'Quantity below shipped',
      })
      .refine((value) => isDecimalLte(value, maxQuantity), {
        message: 'Quantity exceeds billable',
      }),
    notes: z.string().trim().optional(),
  });
}

type EditLineFormValues = z.infer<ReturnType<typeof createEditLineSchema>>;

interface InvoiceLineFormDialogProps {
  open: boolean;
  onClose: () => void;
  companyId: string;
  invoiceId: string;
  requestIds?: string[];
  quoteIds?: string[];
  shippedQuantity?: string;
  line: InvoiceLine;
  onSuccess?: () => void;
}

export function InvoiceLineFormDialog({
  open,
  onClose,
  companyId,
  invoiceId,
  requestIds,
  quoteIds,
  shippedQuantity = '0',
  line,
  onSuccess,
}: InvoiceLineFormDialogProps) {
  const { t } = useTranslation('invoices');

  const [updateLine, updateState] = useUpdateInvoiceLineMutation();

  const requestId = line.requestLine?.requestId;
  const { quoteId } = useSupplierQuoteForRequest(
    companyId,
    requestId,
    open && Boolean(requestId),
  );

  const billableQuery = useGetQuoteBillableLinesQuery(
    { companyId, quoteId: quoteId ?? '' },
    { skip: !open || !quoteId },
  );

  const billableLines = billableQuery.data?.lines ?? [];

  const maxQuantity =
    billableLines.find(
      (item) => item.selectionLineId === line.selectionLine?.id,
    )?.quantity ?? line.quantity;

  const minQuantity = shippedQuantity;

  const editSchema = useMemo(
    () => createEditLineSchema(maxQuantity, minQuantity),
    [maxQuantity, minQuantity],
  );

  const editForm = useForm<EditLineFormValues>({
    resolver: zodResolver(editSchema),
    defaultValues: {
      quantity: line.quantity,
      notes: line.notes ?? '',
    },
  });

  const editQuantity = editForm.watch('quantity');

  useEffect(() => {
    if (!open) {
      return;
    }

    editForm.reset({
      quantity: line.quantity,
      notes: line.notes ?? '',
    });
  }, [open, line, editForm]);

  async function handleEditSubmit(values: EditLineFormValues) {
    const billableMax =
      billableLines.find(
        (item) => item.selectionLineId === line.selectionLine?.id,
      )?.quantity ?? line.quantity;

    if (
      !isDecimalGte(values.quantity, minQuantity) ||
      !isDecimalLte(values.quantity, billableMax)
    ) {
      return;
    }

    await updateLine({
      companyId,
      invoiceId,
      lineId: line.id,
      requestIds,
      quoteIds,
      quantity: values.quantity,
      notes: values.notes || null,
    }).unwrap();

    onSuccess?.();
    onClose();
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{t('form.editLineTitle')}</DialogTitle>
      <DialogContent>
        <ApiErrorAlert error={updateState.error ?? billableQuery.error} />
        <Box
          component="form"
          id="invoice-line-edit-form"
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
              value={maxQuantity}
              fullWidth
              disabled
            />
            <TextField
              label={t('form.minQuantity')}
              value={minQuantity}
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
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t('actions.dismiss')}</Button>
        <Button
          type="submit"
          form="invoice-line-edit-form"
          variant="contained"
          disabled={updateState.isLoading}
        >
          {t('actions.save')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
