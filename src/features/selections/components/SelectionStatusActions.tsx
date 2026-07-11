import { useState } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';

import type { PurchaseSelectionStatus } from '@/api/generated/models/purchaseSelectionStatus';
import {
  useCancelSelectionMutation,
  useConfirmSelectionMutation,
} from '@/api/endpoints/selectionsApi';
import { ApiErrorAlert } from '@/components/ApiErrorAlert';
import { PermissionGate } from '@/components/PermissionGate';

interface SelectionStatusActionsProps {
  companyId: string;
  selectionId: string;
  materialRequestId: string;
  status: PurchaseSelectionStatus;
}

export function SelectionStatusActions({
  companyId,
  selectionId,
  materialRequestId,
  status,
}: SelectionStatusActionsProps) {
  const { t } = useTranslation('selections');
  const { enqueueSnackbar } = useSnackbar();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);

  const [confirmSelection, confirmState] = useConfirmSelectionMutation();
  const [cancelSelection, cancelState] = useCancelSelectionMutation();

  if (status !== 'DRAFT') {
    return null;
  }

  async function handleConfirm() {
    await confirmSelection({
      companyId,
      selectionId,
      materialRequestId,
    }).unwrap();
    enqueueSnackbar(t('toast.confirmed'), { variant: 'success' });
    setConfirmOpen(false);
  }

  async function handleCancel() {
    await cancelSelection({
      companyId,
      selectionId,
      materialRequestId,
    }).unwrap();
    enqueueSnackbar(t('toast.cancelled'), { variant: 'success' });
    setCancelOpen(false);
  }

  return (
    <PermissionGate permission="manageSelections">
      <Button variant="contained" onClick={() => setConfirmOpen(true)}>
        {t('actions.confirm')}
      </Button>
      <Button
        variant="outlined"
        color="error"
        onClick={() => setCancelOpen(true)}
        sx={{ ml: 1 }}
      >
        {t('actions.cancel')}
      </Button>

      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>{t('confirm.confirmTitle')}</DialogTitle>
        <DialogContent>
          <ApiErrorAlert error={confirmState.error} />
          <Typography>{t('confirm.confirmMessage')}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>
            {t('actions.dismiss')}
          </Button>
          <Button
            variant="contained"
            onClick={handleConfirm}
            disabled={confirmState.isLoading}
          >
            {t('actions.confirm')}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={cancelOpen} onClose={() => setCancelOpen(false)}>
        <DialogTitle>{t('confirm.cancelTitle')}</DialogTitle>
        <DialogContent>
          <ApiErrorAlert error={cancelState.error} />
          <Typography>{t('confirm.cancelMessage')}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCancelOpen(false)}>
            {t('actions.dismiss')}
          </Button>
          <Button
            color="error"
            variant="contained"
            onClick={handleCancel}
            disabled={cancelState.isLoading}
          >
            {t('actions.cancel')}
          </Button>
        </DialogActions>
      </Dialog>
    </PermissionGate>
  );
}
