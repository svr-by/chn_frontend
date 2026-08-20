import { useEffect, useMemo, useState } from 'react';
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
  Typography,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';

import { ApiErrorAlert } from '@/components/feedback/apiErrorAlert/ApiErrorAlert';
import { DecimalInput } from '@/components/forms/decimalInput/DecimalInput';
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
  allowRemove?: boolean;
  isRemoving?: boolean;
  removeError?: unknown;
  onRemove?: () => void | Promise<void>;
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
  allowRemove = false,
  isRemoving = false,
  removeError,
  onRemove,
}: QuoteLineSelectionDialogProps) {
  const { t } = useTranslation('quotes');
  const [removeConfirmOpen, setRemoveConfirmOpen] = useState(false);

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
      setRemoveConfirmOpen(false);
      return;
    }

    reset({
      quantity: initialQuantity ?? maxQuantity,
      notes: initialNotes ?? '',
    });
  }, [open, initialQuantity, initialNotes, maxQuantity, reset]);

  function handleClose() {
    if (isSubmitting || isRemoving) {
      return;
    }
    onClose();
  }

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>
        {removeConfirmOpen ? t('selection.removeTitle') : title}
      </DialogTitle>
      <DialogContent>
        {removeConfirmOpen ? (
          <Stack spacing={2} sx={{ pt: 1 }}>
            <ApiErrorAlert
              error={
                removeError as Parameters<typeof ApiErrorAlert>[0]['error']
              }
            />
            <Typography>{t('selection.removeMessage')}</Typography>
          </Stack>
        ) : (
          <Stack
            component="form"
            id="quote-line-selection-form"
            spacing={2}
            sx={{ pt: 1 }}
            onSubmit={handleSubmit((values) =>
              onSubmit({
                quantity: values.quantity,
                notes: values.notes.trim() ? values.notes.trim() : null,
              }),
            )}
          >
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
        )}
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'space-between' }}>
        {removeConfirmOpen ? (
          <>
            <Button onClick={() => setRemoveConfirmOpen(false)} disabled={isRemoving}>
              {t('actions.cancel')}
            </Button>
            <Button
              color="error"
              variant="contained"
              disabled={isRemoving}
              onClick={() => void onRemove?.()}
            >
              {t('selection.remove')}
            </Button>
          </>
        ) : (
          <>
            <Box>
              {allowRemove ? (
                <Button
                  color="error"
                  onClick={() => setRemoveConfirmOpen(true)}
                  disabled={isSubmitting || isRemoving}
                >
                  {t('selection.remove')}
                </Button>
              ) : null}
            </Box>
            <Stack direction="row" spacing={1}>
              <Button onClick={handleClose} disabled={isSubmitting || isRemoving}>
                {t('actions.cancel')}
              </Button>
              <Button
                type="submit"
                form="quote-line-selection-form"
                variant="contained"
                disabled={isSubmitting || isRemoving}
              >
                {t('selection.save')}
              </Button>
            </Stack>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
}
