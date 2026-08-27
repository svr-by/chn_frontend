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
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import SendOutlinedIcon from '@mui/icons-material/SendOutlined';
import { useTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';

import type { SupplierInvoiceStatus } from '@/api/generated/models/supplierInvoiceStatus';
import {
  useConfirmInvoiceMutation,
  useDeleteInvoiceMutation,
  useIssueInvoiceMutation,
} from '@/api/endpoints/invoicesApi';
import { ApiErrorAlert } from '@/components/feedback/apiErrorAlert/ApiErrorAlert';
import { DocumentActionMenuItem } from '@/layouts/documentDetailLayout/DocumentDetailActionsMenu';
import { PermissionGate } from '@/components/auth/permissionGate/PermissionGate';

interface InvoiceActionsProps {
  companyId: string;
  invoiceId: string;
  requestIds?: string[];
  quoteIds?: string[];
  status: SupplierInvoiceStatus;
}

/** Visible Issue CTA for draft invoices in the document header. */
export function InvoiceHeaderActions({
  companyId,
  invoiceId,
  requestIds,
  quoteIds,
  status,
}: InvoiceActionsProps) {
  const { t } = useTranslation('invoices');
  const { enqueueSnackbar } = useSnackbar();
  const [issueOpen, setIssueOpen] = useState(false);
  const [issueInvoice, issueState] = useIssueInvoiceMutation();

  if (status !== 'DRAFT') {
    return null;
  }

  async function handleIssue() {
    await issueInvoice({
      companyId,
      invoiceId,
      requestIds,
      quoteIds,
    }).unwrap();
    enqueueSnackbar(t('toast.issued'), { variant: 'success' });
    setIssueOpen(false);
  }

  return (
    <PermissionGate permission="manageInvoices">
      <Button
        variant="contained"
        size="small"
        startIcon={<SendOutlinedIcon />}
        onClick={() => setIssueOpen(true)}
      >
        {t('actions.issue')}
      </Button>

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
    </PermissionGate>
  );
}

/** Secondary invoice actions for the header ⋮ menu (Delete, Confirm). */
export function InvoiceStatusActions({
  companyId,
  invoiceId,
  requestIds,
  quoteIds,
  status,
}: InvoiceActionsProps) {
  const { t } = useTranslation('invoices');
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const [deleteInvoice, deleteState] = useDeleteInvoiceMutation();
  const [confirmInvoice, confirmState] = useConfirmInvoiceMutation();

  const canDelete = status === 'DRAFT';
  const canConfirm = status === 'PAID';

  if (!canDelete && !canConfirm) {
    return null;
  }

  async function handleDelete() {
    await deleteInvoice({
      companyId,
      invoiceId,
      requestIds,
      quoteIds,
    }).unwrap();
    enqueueSnackbar(t('toast.deleted'), { variant: 'success' });
    setDeleteOpen(false);
    navigate('/app/invoices');
  }

  async function handleConfirm() {
    await confirmInvoice({
      companyId,
      invoiceId,
      requestIds,
      quoteIds,
    }).unwrap();
    enqueueSnackbar(t('toast.confirmed'), { variant: 'success' });
    setConfirmOpen(false);
  }

  return (
    <PermissionGate permission="manageInvoices">
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
      {canConfirm ? (
        <DocumentActionMenuItem onClick={() => setConfirmOpen(true)}>
          <ListItemIcon>
            <CheckCircleOutlineOutlinedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>{t('actions.confirmInvoice')}</ListItemText>
        </DocumentActionMenuItem>
      ) : null}

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
            onClick={() => void handleConfirm()}
            disabled={confirmState.isLoading}
          >
            {t('actions.confirmInvoice')}
          </Button>
        </DialogActions>
      </Dialog>
    </PermissionGate>
  );
}
