import { useEffect, useMemo } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';

import { ApiErrorAlert } from '@/components/ApiErrorAlert';
import { DecimalInput } from '@/components/DecimalInput';
import { isValidDecimal } from '@/lib/decimal';

type SelectionFormValues = {
  quantity: string;
  notes: string;
};

interface QuoteLineSelectionDialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  maxQuantity: string;
  initialQuantity?: string;
  initialNotes?: string | null;
  isSubmitting: boolean;
  error: unknown;
  onSubmit: (values: { quantity: string; notes: string | null }) => void;
}

export function QuoteLineSelectionDialog({
  open,
  onClose,
  title,
  maxQuantity,
  initialQuantity,
  initialNotes,
  isSubmitting,
  error,
  onSubmit,
}: QuoteLineSelectionDialogProps) {
  const { t } = useTranslation('quotes');

  const schema = useMemo(
    () =>
      z.object({
        quantity: z.string().refine(isValidDecimal, {
          message: t('selection.validation.quantity'),
        }),
        notes: z.string(),
      }),
    [t],
  );

  const {
    control,
    handleSubmit,
    reset,
    register,
    formState: { errors },
  } = useForm<SelectionFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      quantity: initialQuantity ?? maxQuantity,
      notes: initialNotes ?? '',
    },
  });

  useEffect(() => {
    if (!open) {
      return;
    }

    reset({
      quantity: initialQuantity ?? maxQuantity,
      notes: initialNotes ?? '',
    });
  }, [open, initialQuantity, initialNotes, maxQuantity, reset]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <form
        onSubmit={handleSubmit((values) =>
          onSubmit({
            quantity: values.quantity,
            notes: values.notes.trim() ? values.notes.trim() : null,
          }),
        )}
      >
        <DialogTitle>{title}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <ApiErrorAlert
              error={error as Parameters<typeof ApiErrorAlert>[0]['error']}
            />
            <Controller
              name="quantity"
              control={control}
              render={({ field }) => (
                <DecimalInput
                  label={t('selection.quantity')}
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  helperText={t('selection.maxQuantityHint', {
                    quantity: maxQuantity,
                  })}
                  error={Boolean(errors.quantity)}
                  fullWidth
                />
              )}
            />
            <TextField
              {...register('notes')}
              label={t('selection.notes')}
              multiline
              minRows={2}
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>{t('actions.cancel')}</Button>
          <Button type="submit" variant="contained" disabled={isSubmitting}>
            {t('selection.save')}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
