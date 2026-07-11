import { useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Box, Button, Stack, TextField } from '@mui/material';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';
import { z } from 'zod';

import type { PurchaseSelection } from '@/api/generated/models/purchaseSelection';
import { useUpdateSelectionMutation } from '@/api/endpoints/selectionsApi';
import { ApiErrorAlert } from '@/components/ApiErrorAlert';

const headerSchema = z.object({
  notes: z.string().trim().optional(),
});

type HeaderFormValues = z.infer<typeof headerSchema>;

interface SelectionHeaderFormProps {
  companyId: string;
  selection: PurchaseSelection;
  editable: boolean;
}

export function SelectionHeaderForm({
  companyId,
  selection,
  editable,
}: SelectionHeaderFormProps) {
  const { t } = useTranslation('selections');
  const { enqueueSnackbar } = useSnackbar();

  const [updateSelection, updateState] = useUpdateSelectionMutation();

  const {
    register,
    handleSubmit,
    reset,
    formState: { isDirty },
  } = useForm<HeaderFormValues>({
    resolver: zodResolver(headerSchema),
    defaultValues: {
      notes: selection.notes ?? '',
    },
  });

  useEffect(() => {
    reset({
      notes: selection.notes ?? '',
    });
  }, [selection, reset]);

  async function onSubmit(values: HeaderFormValues) {
    await updateSelection({
      companyId,
      selectionId: selection.id,
      materialRequestId: selection.materialRequestId,
      notes: values.notes || null,
    }).unwrap();

    enqueueSnackbar(t('toast.updated'), { variant: 'success' });
  }

  if (!editable) {
    return selection.notes ? (
      <Stack spacing={1}>
        <Box>
          <strong>{t('form.notes')}:</strong> {selection.notes}
        </Box>
      </Stack>
    ) : null;
  }

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)}>
      <ApiErrorAlert error={updateState.error} />
      <Stack spacing={2}>
        <TextField
          label={t('form.notes')}
          fullWidth
          multiline
          minRows={2}
          {...register('notes')}
        />
        <Box>
          <Button
            type="submit"
            variant="outlined"
            disabled={!isDirty || updateState.isLoading}
          >
            {t('actions.saveHeader')}
          </Button>
        </Box>
      </Stack>
    </Box>
  );
}
