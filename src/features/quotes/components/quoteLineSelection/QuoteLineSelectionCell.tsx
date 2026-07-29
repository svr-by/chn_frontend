import { useState } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import CheckBoxOutlineBlankOutlinedIcon from '@mui/icons-material/CheckBoxOutlineBlankOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import { useTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';

import {
  useDeleteQuoteLineSelectionMutation,
  usePutQuoteLineSelectionMutation,
} from '@/api/endpoints/quotesApi';
import { ApiErrorAlert } from '@/components/ApiErrorAlert';
import { DecimalDisplay } from '@/components/DecimalDisplay';
import { PermissionGate } from '@/components/PermissionGate';
import { QuoteLineSelectionDialog } from './QuoteLineSelectionDialog';

interface QuoteLineSelectionCellProps {
  companyId: string;
  quoteId: string;
  lineId: string;
  maxQuantity: string;
  selectedQuantity: string | null | undefined;
  materialRequestId?: string;
  disabled?: boolean;
}

export function QuoteLineSelectionCell({
  companyId,
  quoteId,
  lineId,
  maxQuantity,
  selectedQuantity,
  materialRequestId,
  disabled = false,
}: QuoteLineSelectionCellProps) {
  const { t } = useTranslation('quotes');
  const { enqueueSnackbar } = useSnackbar();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

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
    setDeleteConfirmOpen(false);
  }

  if (disabled) {
    return isSelected ? (
      <DecimalDisplay value={selectedQuantity} />
    ) : (
      <Typography variant="body2" color="text.secondary">—</Typography>
    );
  }

  return (
    <PermissionGate permission="manageQuotes">
      {isSelected ? (
        <Stack direction="row" spacing={0.5} alignItems="center">
          <DecimalDisplay value={selectedQuantity} />
          <Tooltip title={t('selection.edit')}>
            <IconButton
              size="small"
              aria-label={t('selection.edit')}
              onClick={() => setDialogOpen(true)}
            >
              <EditOutlinedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title={t('selection.remove')}>
            <IconButton
              size="small"
              color="error"
              aria-label={t('selection.remove')}
              onClick={() => setDeleteConfirmOpen(true)}
            >
              <DeleteOutlineOutlinedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      ) : (
        <Button
          size="small"
          variant="outlined"
          startIcon={<CheckBoxOutlineBlankOutlinedIcon />}
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
      />

      <Dialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
      >
        <DialogTitle>{t('selection.removeTitle')}</DialogTitle>
        <DialogContent>
          <ApiErrorAlert error={deleteState.error} />
          <Typography>{t('selection.removeMessage')}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)}>
            {t('actions.cancel')}
          </Button>
          <Button
            color="error"
            variant="contained"
            disabled={deleteState.isLoading}
            onClick={() => void handleDelete()}
          >
            {t('selection.remove')}
          </Button>
        </DialogActions>
      </Dialog>
    </PermissionGate>
  );
}
