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
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import { useTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';

import { useDeleteRequestMutation } from '@/api/endpoints/requestsApi';
import { ApiErrorAlert } from '@/components/ApiErrorAlert';
import { PermissionGate } from '@/components/PermissionGate';
import { RequestDistributeDialog } from '@/features/requests/components/RequestDistributeDialog';
import { useOpenRequestSelection } from '@/features/selections/hooks/useOpenRequestSelection';
import type { RequestLine } from '@/api/generated/models/requestLine';
import type { MaterialRequestStatus } from '@/types/api';

interface RequestStatusActionsProps {
  companyId: string;
  requestId: string;
  status: MaterialRequestStatus | string;
  requestLines?: RequestLine[];
}

export function RequestStatusActions({
  companyId,
  requestId,
  status,
  requestLines = [],
}: RequestStatusActionsProps) {
  const { t } = useTranslation('requests');
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  // const [distributeOpen, setDistributeOpen] = useState(false);

  const [deleteRequest, deleteState] = useDeleteRequestMutation();
  // const { openRequestSelection, isOpening, error: openSelectionError } =
  //   useOpenRequestSelection();

  if (status === 'DRAFT') {
    return (
      <PermissionGate permission="manageRequests">
        <Stack direction="row" spacing={1}>
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteOutlineOutlinedIcon />}
            onClick={() => setDeleteConfirmOpen(true)}
          >
            {t('actions.delete')}
          </Button>
          {/* <Button variant="contained" onClick={() => setDistributeOpen(true)}>
            {t('actions.sendToSuppliers')}
          </Button> */}
        </Stack>

        {/* <RequestDistributeDialog
          open={distributeOpen}
          companyId={companyId}
          requestId={requestId}
          requestLines={requestLines}
          onClose={() => setDistributeOpen(false)}
        /> */}

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

  // if (status === 'QUOTING') {
  //   return (
  //     <Stack direction="row" spacing={1}>
  //       <PermissionGate permission="manageRequests">
  //         <Button variant="outlined" onClick={() => setDistributeOpen(true)}>
  //           {t('actions.addSuppliers')}
  //         </Button>
  //         <RequestDistributeDialog
  //           open={distributeOpen}
  //           companyId={companyId}
  //           requestId={requestId}
  //           requestLines={requestLines}
  //           onClose={() => setDistributeOpen(false)}
  //         />
  //       </PermissionGate>
  //       <PermissionGate permission="viewRequests">
  //         <Button
  //           variant="outlined"
  //           component={RouterLink}
  //           to={`/app/requests/${requestId}/compare`}
  //         >
  //           {t('actions.compare')}
  //         </Button>
  //       </PermissionGate>
  //       <PermissionGate permission="manageSelections">
  //         <Button
  //           variant="contained"
  //           onClick={() => openRequestSelection(requestId)}
  //           disabled={isOpening}
  //         >
  //           {t('actions.manageSelection')}
  //         </Button>
  //       </PermissionGate>
  //       <ApiErrorAlert error={openSelectionError} />
  //     </Stack>
  //   );
  // }

  // if (status === 'PARTIALLY_ORDERED') {
  //   return (
  //     <Stack direction="row" spacing={1}>
  //       <PermissionGate permission="viewRequests">
  //         <Button
  //           variant="outlined"
  //           component={RouterLink}
  //           to={`/app/requests/${requestId}/compare`}
  //         >
  //           {t('actions.compare')}
  //         </Button>
  //       </PermissionGate>
  //       <PermissionGate permission="manageSelections">
  //         <Button
  //           variant="contained"
  //           onClick={() => openRequestSelection(requestId)}
  //           disabled={isOpening}
  //         >
  //           {t('actions.manageSelection')}
  //         </Button>
  //       </PermissionGate>
  //       <ApiErrorAlert error={openSelectionError} />
  //     </Stack>
  //   );
  // }

  return null;
}
