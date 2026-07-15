import { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Typography,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';

import {
  useDeleteRequestMutation,
  useSubmitRequestMutation,
} from '@/api/endpoints/requestsApi';
import { ApiErrorAlert } from '@/components/ApiErrorAlert';
import { PermissionGate } from '@/components/PermissionGate';
import { RequestDistributeDialog } from '@/features/requests/components/RequestDistributeDialog';
import { useOpenRequestSelection } from '@/features/selections/hooks/useOpenRequestSelection';
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
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [submitConfirmOpen, setSubmitConfirmOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [distributeOpen, setDistributeOpen] = useState(false);

  const [submitRequest, submitState] = useSubmitRequestMutation();
  const [deleteRequest, deleteState] = useDeleteRequestMutation();
  const { openRequestSelection, isOpening, error: openSelectionError } =
    useOpenRequestSelection();

  if (status === 'DRAFT') {
    return (
      <PermissionGate permission="manageRequests">
        <Stack direction="row" spacing={1}>
          <Button
            variant="outlined"
            color="error"
            onClick={() => setDeleteConfirmOpen(true)}
          >
            {t('actions.delete')}
          </Button>
          <Button variant="contained" onClick={() => setSubmitConfirmOpen(true)}>
            {t('actions.submit')}
          </Button>
        </Stack>

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

        <Dialog
          open={deleteConfirmOpen}
          onClose={() => setDeleteConfirmOpen(false)}
        >
          <DialogTitle>{t('confirm.deleteTitle')}</DialogTitle>
          <DialogContent>
            <ApiErrorAlert error={deleteState.error} />
            <Typography>{t('confirm.deleteMessage')}</Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteConfirmOpen(false)}>
              {t('actions.cancel')}
            </Button>
            <Button
              color="error"
              variant="contained"
              onClick={async () => {
                await deleteRequest({ companyId, requestId }).unwrap();
                enqueueSnackbar(t('toast.deleted'), { variant: 'success' });
                setDeleteConfirmOpen(false);
                navigate('/app/requests');
              }}
              disabled={deleteState.isLoading}
            >
              {t('actions.delete')}
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
      <Stack direction="row" spacing={1}>
        <PermissionGate permission="viewRequests">
          <Button
            variant="outlined"
            component={RouterLink}
            to={`/app/requests/${requestId}/compare`}
          >
            {t('actions.compare')}
          </Button>
        </PermissionGate>
        <PermissionGate permission="manageSelections">
          <Button
            variant="contained"
            onClick={() => openRequestSelection(requestId)}
            disabled={isOpening}
          >
            {t('actions.manageSelection')}
          </Button>
        </PermissionGate>
        <ApiErrorAlert error={openSelectionError} />
      </Stack>
    );
  }

  return null;
}
