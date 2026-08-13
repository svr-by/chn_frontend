import { useState } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  ListItemIcon,
  ListItemText,
  TextField,
  Typography,
} from '@mui/material';
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import { useTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';

import type { PaymentStatus } from '@/api/generated/models/paymentStatus';
import {
  useConfirmPaymentMutation,
  useRejectPaymentMutation,
} from '@/api/endpoints/paymentsApi';
import { ApiErrorAlert } from '@/components/ApiErrorAlert';
import { DocumentActionMenuItem } from '@/layouts/documentDetailLayout/DocumentDetailActionsMenu';
import { PermissionGate } from '@/components/PermissionGate';

interface PaymentStatusActionsProps {
  companyId: string;
  paymentId: string;
  invoiceId: string;
  status: PaymentStatus;
}

export function PaymentStatusActions({
  companyId,
  paymentId,
  invoiceId,
  status,
}: PaymentStatusActionsProps) {
  const { t } = useTranslation('payments');
  const { enqueueSnackbar } = useSnackbar();
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  const [confirmPayment, confirmState] = useConfirmPaymentMutation();
  const [rejectPayment, rejectState] = useRejectPaymentMutation();

  if (status !== 'UPLOADED') {
    return null;
  }

  async function handleConfirm() {
    await confirmPayment({ companyId, paymentId, invoiceId }).unwrap();
    enqueueSnackbar(t('toast.confirmed'), { variant: 'success' });
  }

  async function handleReject() {
    if (!rejectionReason.trim()) {
      return;
    }

    await rejectPayment({
      companyId,
      paymentId,
      invoiceId,
      rejectionReason: rejectionReason.trim(),
    }).unwrap();

    enqueueSnackbar(t('toast.rejected'), { variant: 'success' });
    setRejectOpen(false);
    setRejectionReason('');
  }

  return (
    <PermissionGate permission="confirmPayments">
      <DocumentActionMenuItem
        onClick={() => void handleConfirm()}
        disabled={confirmState.isLoading}
      >
        <ListItemIcon>
          <CheckCircleOutlineOutlinedIcon fontSize="small" />
        </ListItemIcon>
        <ListItemText>{t('actions.confirm')}</ListItemText>
      </DocumentActionMenuItem>
      <DocumentActionMenuItem
        onClick={() => setRejectOpen(true)}
        sx={{ color: 'error.main' }}
      >
        <ListItemIcon sx={{ color: 'inherit' }}>
          <CloseOutlinedIcon fontSize="small" />
        </ListItemIcon>
        <ListItemText>{t('actions.reject')}</ListItemText>
      </DocumentActionMenuItem>

      <Dialog open={rejectOpen} onClose={() => setRejectOpen(false)}>
        <DialogTitle>{t('reject.title')}</DialogTitle>
        <DialogContent>
          <ApiErrorAlert error={rejectState.error} />
          <Typography sx={{ mb: 2 }}>{t('reject.message')}</Typography>
          <TextField
            label={t('reject.reason')}
            fullWidth
            required
            multiline
            minRows={2}
            value={rejectionReason}
            onChange={(event) => setRejectionReason(event.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRejectOpen(false)}>
            {t('actions.dismiss')}
          </Button>
          <Button
            color="error"
            variant="contained"
            onClick={handleReject}
            disabled={!rejectionReason.trim() || rejectState.isLoading}
          >
            {t('actions.reject')}
          </Button>
        </DialogActions>
      </Dialog>
    </PermissionGate>
  );
}
