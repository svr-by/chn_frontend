import { useState } from 'react';
import {
  Button,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import { useTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';

import {
  useDeleteQuoteLineSelectionMutation,
  usePutQuoteLineSelectionMutation,
} from '@/api/endpoints/quotesApi';
import { DecimalDisplay } from '@/components/dataDisplay/decimalDisplay/DecimalDisplay';
import { PermissionGate } from '@/components/auth/permissionGate/PermissionGate';
import { QuoteLineSelectionDialog } from './QuoteLineSelectionDialog';

interface QuoteLineSelectionCellProps {
  companyId: string;
  quoteId: string;
  lineId: string;
  maxQuantity: string;
  selectedQuantity: string | null | undefined;
  unit?: string | null;
  materialRequestId?: string;
  disabled?: boolean;
}

export function QuoteLineSelectionCell({
  companyId,
  quoteId,
  lineId,
  maxQuantity,
  selectedQuantity,
  unit,
  materialRequestId,
  disabled = false,
}: QuoteLineSelectionCellProps) {
  const { t } = useTranslation('quotes');
  const { enqueueSnackbar } = useSnackbar();
  const [dialogOpen, setDialogOpen] = useState(false);

  const [putSelection, putState] = usePutQuoteLineSelectionMutation();
  const [deleteSelection, deleteState] = useDeleteQuoteLineSelectionMutation();

  const isSelected = selectedQuantity != null;

  async function handleSave(values: { quantity: string; notes: string | null }) {
    await putSelection({
      companyId,
      quoteId,
      lineId,
      materialRequestId,
      quantity: values.quantity,
      notes: values.notes,
    }).unwrap();

    enqueueSnackbar(
      isSelected ? t('toast.selectionUpdated') : t('toast.selectionSaved'),
      { variant: 'success' },
    );
    setDialogOpen(false);
  }

  async function handleDelete() {
    await deleteSelection({
      companyId,
      quoteId,
      lineId,
      materialRequestId,
    }).unwrap();

    enqueueSnackbar(t('toast.selectionRemoved'), { variant: 'success' });
    setDialogOpen(false);
  }

  if (disabled) {
    return isSelected ? (
      <DecimalDisplay value={selectedQuantity} suffix={unit} />
    ) : (
      <Typography variant="body2" color="text.secondary">—</Typography>
    );
  }

  return (
    <PermissionGate permission="manageQuotes">
      {isSelected ? (
        <Stack
          direction="row"
          spacing={0.5}
          alignItems="center"
          justifyContent="flex-end"
          flexWrap="nowrap"
        >
          <DecimalDisplay value={selectedQuantity} suffix={unit} />
          <Tooltip title={t('selection.edit')}>
            <IconButton
              size="small"
              aria-label={t('selection.edit')}
              onClick={() => setDialogOpen(true)}
            >
              <EditOutlinedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      ) : (
        <Button
          size="small"
          variant="outlined"
          onClick={() => setDialogOpen(true)}
        >
          {t('selection.select')}
        </Button>
      )}

      <QuoteLineSelectionDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        title={
          isSelected ? t('selection.editTitle') : t('selection.selectTitle')
        }
        maxQuantity={maxQuantity}
        initialQuantity={selectedQuantity ?? maxQuantity}
        isSubmitting={putState.isLoading}
        error={putState.error}
        onSubmit={(values) => void handleSave(values)}
        allowRemove={isSelected}
        isRemoving={deleteState.isLoading}
        removeError={deleteState.error}
        onRemove={() => void handleDelete()}
      />
    </PermissionGate>
  );
}
