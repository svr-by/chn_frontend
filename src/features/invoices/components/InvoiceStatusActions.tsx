import { useState } from 'react';
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
import SendOutlinedIcon from '@mui/icons-material/SendOutlined';
import { useTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';

import type { SupplierInvoiceStatus } from '@/api/generated/models/supplierInvoiceStatus';
import {
  useConfirmInvoiceMutation,
  useIssueInvoiceMutation,
} from '@/api/endpoints/invoicesApi';
import { ApiErrorAlert } from '@/components/ApiErrorAlert';
import { DocumentActionMenuItem } from '@/layouts/documentDetailLayout/DocumentDetailActionsMenu';
import { PermissionGate } from '@/components/PermissionGate';

interface InvoiceStatusActionsProps {
  companyId: string;
  invoiceId: string;
  requestIds?: string[];
  quoteIds?: string[];
  status: SupplierInvoiceStatus;
}

export function InvoiceStatusActions({
  companyId,
  invoiceId,
  requestIds,
  quoteIds,
  status,
}: InvoiceStatusActionsProps) {
  const { t } = useTranslation('invoices');
  const { enqueueSnackbar } = useSnackbar();
  const [issueOpen, setIssueOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const [issueInvoice, issueState] = useIssueInvoiceMutation();
  const [confirmInvoice, confirmState] = useConfirmInvoiceMutation();

  if (status !== 'DRAFT' && status !== 'PAID') {
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
      {status === 'DRAFT' ? (
        <DocumentActionMenuItem onClick={() => setIssueOpen(true)}>
          <ListItemIcon>
            <SendOutlinedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>{t('actions.issue')}</ListItemText>
        </DocumentActionMenuItem>
      ) : null}
      {status === 'PAID' ? (
        <DocumentActionMenuItem onClick={() => setConfirmOpen(true)}>
          <ListItemIcon>
            <CheckCircleOutlineOutlinedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>{t('actions.confirmInvoice')}</ListItemText>
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
            onClick={handleIssue}
            disabled={issueState.isLoading}
          >
            {t('actions.issue')}
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
            onClick={handleConfirm}
            disabled={confirmState.isLoading}
          >
            {t('actions.confirmInvoice')}
          </Button>
        </DialogActions>
      </Dialog>
    </PermissionGate>
  );
}
