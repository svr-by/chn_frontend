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

import type { SupplierInvoiceStatus } from '@/api/generated/models/supplierInvoiceStatus';
import {
  useConfirmInvoiceMutation,
  useIssueInvoiceMutation,
} from '@/api/endpoints/invoicesApi';
import { ApiErrorAlert } from '@/components/ApiErrorAlert';
import { PermissionGate } from '@/components/PermissionGate';

interface InvoiceStatusActionsProps {
  companyId: string;
  invoiceId: string;
  materialRequestId?: string;
  quoteId?: string;
  status: SupplierInvoiceStatus;
}

export function InvoiceStatusActions({
  companyId,
  invoiceId,
  materialRequestId,
  quoteId,
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
      materialRequestId,
      quoteId,
    }).unwrap();
    enqueueSnackbar(t('toast.issued'), { variant: 'success' });
    setIssueOpen(false);
  }

  async function handleConfirm() {
    await confirmInvoice({
      companyId,
      invoiceId,
      materialRequestId,
      quoteId,
    }).unwrap();
    enqueueSnackbar(t('toast.confirmed'), { variant: 'success' });
    setConfirmOpen(false);
  }

  return (
    <PermissionGate permission="manageInvoices">
      {status === 'DRAFT' ? (
        <>
          <Button variant="contained" onClick={() => setIssueOpen(true)}>
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
                onClick={handleIssue}
                disabled={issueState.isLoading}
              >
                {t('actions.issue')}
              </Button>
            </DialogActions>
          </Dialog>
        </>
      ) : null}
      {status === 'PAID' ? (
        <>
          <Button variant="contained" onClick={() => setConfirmOpen(true)}>
            {t('actions.confirmInvoice')}
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
                {t('actions.confirmInvoice')}
              </Button>
            </DialogActions>
          </Dialog>
        </>
      ) : null}
    </PermissionGate>
  );
}
