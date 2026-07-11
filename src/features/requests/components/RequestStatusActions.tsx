import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
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
import { RequestDistributeDialog } from '@/features/requests/components/RequestDistributeDialog';
import type { MaterialRequestStatus } from '@/types/api';

interface RequestStatusActionsProps {
  companyId: string;
  requestId: string;
  status: MaterialRequestStatus | string;
}

export function RequestStatusActions({
  companyId,
  requestId,
  status,
}: RequestStatusActionsProps) {
  const { t } = useTranslation('requests');
  const { enqueueSnackbar } = useSnackbar();
  const [submitConfirmOpen, setSubmitConfirmOpen] = useState(false);
  const [distributeOpen, setDistributeOpen] = useState(false);

  const [submitRequest, submitState] = useSubmitRequestMutation();

  if (status === 'DRAFT') {
    return (
      <PermissionGate permission="manageRequests">
        <Button variant="contained" onClick={() => setSubmitConfirmOpen(true)}>
          {t('actions.submit')}
        </Button>

        <Dialog
          open={submitConfirmOpen}
          onClose={() => setSubmitConfirmOpen(false)}
        >
          <DialogTitle>{t('confirm.submitTitle')}</DialogTitle>
          <DialogContent>
            <ApiErrorAlert error={submitState.error} />
            <Typography>{t('confirm.submitMessage')}</Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setSubmitConfirmOpen(false)}>
              {t('actions.cancel')}
            </Button>
            <Button
              variant="contained"
              onClick={async () => {
                await submitRequest({ companyId, requestId }).unwrap();
                enqueueSnackbar(t('toast.submitted'), { variant: 'success' });
                setSubmitConfirmOpen(false);
              }}
              disabled={submitState.isLoading}
            >
              {t('actions.submit')}
            </Button>
          </DialogActions>
        </Dialog>
      </PermissionGate>
    );
  }

  if (status === 'SUBMITTED') {
    return (
      <PermissionGate permission="manageRequests">
        <Button variant="contained" onClick={() => setDistributeOpen(true)}>
          {t('actions.distribute')}
        </Button>
        <RequestDistributeDialog
          open={distributeOpen}
          companyId={companyId}
          requestId={requestId}
          onClose={() => setDistributeOpen(false)}
        />
      </PermissionGate>
    );
  }

  if (status === 'QUOTING' || status === 'PARTIALLY_ORDERED') {
    return (
      <PermissionGate permission="viewRequests">
        <Button
          variant="outlined"
          component={RouterLink}
          to={`/app/requests/${requestId}/compare`}
        >
          {t('actions.compare')}
        </Button>
      </PermissionGate>
    );
  }

  return null;
}
