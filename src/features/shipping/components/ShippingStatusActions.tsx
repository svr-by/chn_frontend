import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  ListItemIcon,
  ListItemText,
  Typography,
} from '@mui/material';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import SendOutlinedIcon from '@mui/icons-material/SendOutlined';
import WhereToVoteOutlinedIcon from '@mui/icons-material/WhereToVoteOutlined';
import { useTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';

import type { ShippingInvoiceStatus } from '@/api/generated/models/shippingInvoiceStatus';
import {
  useDeleteShippingInvoiceMutation,
  useIssueShippingInvoiceMutation,
  useMarkShippingDeliveredMutation,
  useMarkShippingInTransitMutation,
} from '@/api/endpoints/shippingInvoicesApi';
import { ApiErrorAlert } from '@/components/feedback/apiErrorAlert/ApiErrorAlert';
import { DocumentActionMenuItem } from '@/layouts/documentDetailLayout/DocumentDetailActionsMenu';
import { PermissionGate } from '@/components/auth/permissionGate/PermissionGate';

interface ShippingStatusActionsProps {
  companyId: string;
  shippingInvoiceId: string;
  supplierInvoiceId: string;
  status: ShippingInvoiceStatus;
}

export function ShippingStatusActions({
  companyId,
  shippingInvoiceId,
  supplierInvoiceId,
  status,
}: ShippingStatusActionsProps) {
  const { t } = useTranslation('shipping');
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [issueOpen, setIssueOpen] = useState(false);
  const [transitOpen, setTransitOpen] = useState(false);
  const [deliveredOpen, setDeliveredOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const [issueShipping, issueState] = useIssueShippingInvoiceMutation();
  const [markInTransit, transitState] = useMarkShippingInTransitMutation();
  const [markDelivered, deliveredState] = useMarkShippingDeliveredMutation();
  const [deleteShipping, deleteState] = useDeleteShippingInvoiceMutation();

  const canIssue = status === 'DRAFT';
  const canMarkInTransit = status === 'ISSUED';
  const canMarkDelivered = status === 'IN_TRANSIT';
  const canDelete = status === 'DRAFT';

  if (!canIssue && !canMarkInTransit && !canMarkDelivered && !canDelete) {
    return null;
  }

  async function handleIssue() {
    await issueShipping({
      companyId,
      shippingInvoiceId,
      supplierInvoiceId,
    }).unwrap();
    enqueueSnackbar(t('toast.issued'), { variant: 'success' });
    setIssueOpen(false);
  }

  async function handleMarkInTransit() {
    await markInTransit({
      companyId,
      shippingInvoiceId,
      supplierInvoiceId,
    }).unwrap();
    enqueueSnackbar(t('toast.inTransit'), { variant: 'success' });
    setTransitOpen(false);
  }

  async function handleMarkDelivered() {
    await markDelivered({
      companyId,
      shippingInvoiceId,
      supplierInvoiceId,
    }).unwrap();
    enqueueSnackbar(t('toast.delivered'), { variant: 'success' });
    setDeliveredOpen(false);
  }

  async function handleDelete() {
    await deleteShipping({
      companyId,
      shippingInvoiceId,
      supplierInvoiceId,
    }).unwrap();
    enqueueSnackbar(t('toast.deleted'), { variant: 'success' });
    setDeleteOpen(false);
    navigate('/app/shipping-invoices');
  }

  return (
    <PermissionGate permission="manageShippingInvoices">
      {canIssue ? (
        <DocumentActionMenuItem onClick={() => setIssueOpen(true)}>
          <ListItemIcon>
            <SendOutlinedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>{t('actions.issue')}</ListItemText>
        </DocumentActionMenuItem>
      ) : null}
      {canMarkInTransit ? (
        <DocumentActionMenuItem onClick={() => setTransitOpen(true)}>
          <ListItemIcon>
            <LocalShippingOutlinedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>{t('actions.markInTransit')}</ListItemText>
        </DocumentActionMenuItem>
      ) : null}
      {canMarkDelivered ? (
        <DocumentActionMenuItem onClick={() => setDeliveredOpen(true)}>
          <ListItemIcon>
            <WhereToVoteOutlinedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>{t('actions.markDelivered')}</ListItemText>
        </DocumentActionMenuItem>
      ) : null}
      {canDelete ? (
        <DocumentActionMenuItem
          onClick={() => setDeleteOpen(true)}
          sx={{ color: 'error.main' }}
        >
          <ListItemIcon sx={{ color: 'inherit' }}>
            <DeleteOutlineOutlinedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>{t('actions.delete')}</ListItemText>
        </DocumentActionMenuItem>
      ) : null}

      <Dialog open={issueOpen} onClose={() => setIssueOpen(false)}>
        <DialogTitle>{t('confirm.issueTitle')}</DialogTitle>
        <DialogContent>
          <ApiErrorAlert error={issueState.error} />
          <Typography>{t('confirm.issueMessage')}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIssueOpen(false)}>
            {t('actions.dismiss')}
          </Button>
          <Button
            variant="contained"
            onClick={() => void handleIssue()}
            disabled={issueState.isLoading}
          >
            {t('actions.issue')}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={transitOpen} onClose={() => setTransitOpen(false)}>
        <DialogTitle>{t('confirm.inTransitTitle')}</DialogTitle>
        <DialogContent>
          <ApiErrorAlert error={transitState.error} />
          <Typography>{t('confirm.inTransitMessage')}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTransitOpen(false)}>
            {t('actions.dismiss')}
          </Button>
          <Button
            variant="contained"
            onClick={() => void handleMarkInTransit()}
            disabled={transitState.isLoading}
          >
            {t('actions.markInTransit')}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={deliveredOpen} onClose={() => setDeliveredOpen(false)}>
        <DialogTitle>{t('confirm.deliveredTitle')}</DialogTitle>
        <DialogContent>
          <ApiErrorAlert error={deliveredState.error} />
          <Typography>{t('confirm.deliveredMessage')}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeliveredOpen(false)}>
            {t('actions.dismiss')}
          </Button>
          <Button
            variant="contained"
            onClick={() => void handleMarkDelivered()}
            disabled={deliveredState.isLoading}
          >
            {t('actions.markDelivered')}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)}>
        <DialogTitle>{t('confirm.deleteTitle')}</DialogTitle>
        <DialogContent>
          <ApiErrorAlert error={deleteState.error} />
          <Typography>{t('confirm.deleteMessage')}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteOpen(false)}>
            {t('actions.dismiss')}
          </Button>
          <Button
            color="error"
            variant="contained"
            startIcon={<DeleteOutlineOutlinedIcon />}
            onClick={() => void handleDelete()}
            disabled={deleteState.isLoading}
          >
            {t('actions.delete')}
          </Button>
        </DialogActions>
      </Dialog>
    </PermissionGate>
  );
}
