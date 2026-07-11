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

import { useSubmitRequestMutation } from '@/api/endpoints/requestsApi';
import { ApiErrorAlert } from '@/components/ApiErrorAlert';
import { PermissionGate } from '@/components/PermissionGate';

interface RequestStatusActionsProps {
  companyId: string;
  requestId: string;
  status: string;
}

export function RequestStatusActions({
  companyId,
  requestId,
  status,
}: RequestStatusActionsProps) {
  const { t } = useTranslation('requests');
  const { enqueueSnackbar } = useSnackbar();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const [submitRequest, submitState] = useSubmitRequestMutation();

  if (status !== 'DRAFT') {
    return null;
  }

  async function handleSubmit() {
    await submitRequest({ companyId, requestId }).unwrap();
    enqueueSnackbar(t('toast.submitted'), { variant: 'success' });
    setConfirmOpen(false);
  }

  return (
    <PermissionGate permission="manageRequests">
      <Button variant="contained" onClick={() => setConfirmOpen(true)}>
        {t('actions.submit')}
      </Button>

      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>{t('confirm.submitTitle')}</DialogTitle>
        <DialogContent>
          <ApiErrorAlert error={submitState.error} />
          <Typography>{t('confirm.submitMessage')}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>
            {t('actions.cancel')}
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={submitState.isLoading}
          >
            {t('actions.submit')}
          </Button>
        </DialogActions>
      </Dialog>
    </PermissionGate>
  );
}
