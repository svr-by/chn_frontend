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

import type { ShippingInvoiceStatus } from '@/api/generated/models/shippingInvoiceStatus';
import {
  useIssueShippingInvoiceMutation,
  useMarkShippingDeliveredMutation,
  useMarkShippingInTransitMutation,
} from '@/api/endpoints/shippingInvoicesApi';
import { ApiErrorAlert } from '@/components/ApiErrorAlert';
import { PermissionGate } from '@/components/PermissionGate';

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
  const { enqueueSnackbar } = useSnackbar();
  const [issueOpen, setIssueOpen] = useState(false);
  const [transitOpen, setTransitOpen] = useState(false);
  const [deliveredOpen, setDeliveredOpen] = useState(false);

  const [issueShipping, issueState] = useIssueShippingInvoiceMutation();
  const [markInTransit, transitState] = useMarkShippingInTransitMutation();
  const [markDelivered, deliveredState] = useMarkShippingDeliveredMutation();

  if (status !== 'DRAFT' && status !== 'ISSUED' && status !== 'IN_TRANSIT') {
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

  return (
    <PermissionGate permission="manageShippingInvoices">
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
      {status === 'ISSUED' ? (
        <>
          <Button variant="contained" onClick={() => setTransitOpen(true)}>
            {t('actions.markInTransit')}
          </Button>
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
                onClick={handleMarkInTransit}
                disabled={transitState.isLoading}
              >
                {t('actions.markInTransit')}
              </Button>
            </DialogActions>
          </Dialog>
        </>
      ) : null}
      {status === 'IN_TRANSIT' ? (
        <>
          <Button variant="contained" onClick={() => setDeliveredOpen(true)}>
            {t('actions.markDelivered')}
          </Button>
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
                onClick={handleMarkDelivered}
                disabled={deliveredState.isLoading}
              >
                {t('actions.markDelivered')}
              </Button>
            </DialogActions>
          </Dialog>
        </>
      ) : null}
    </PermissionGate>
  );
}
