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

import type { SupplierQuoteStatus } from '@/api/generated/models/supplierQuoteStatus';
import { useSubmitQuoteMutation } from '@/api/endpoints/quotesApi';
import { ApiErrorAlert } from '@/components/ApiErrorAlert';
import { PermissionGate } from '@/components/PermissionGate';

interface QuoteStatusActionsProps {
  companyId: string;
  quoteId: string;
  materialRequestId: string;
  status: SupplierQuoteStatus;
}

export function QuoteStatusActions({
  companyId,
  quoteId,
  materialRequestId,
  status,
}: QuoteStatusActionsProps) {
  const { t } = useTranslation('quotes');
  const { enqueueSnackbar } = useSnackbar();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const [submitQuote, submitState] = useSubmitQuoteMutation();

  if (status !== 'DRAFT') {
    return null;
  }

  async function handleSubmit() {
    await submitQuote({ companyId, quoteId, materialRequestId }).unwrap();
    enqueueSnackbar(t('toast.submitted'), { variant: 'success' });
    setConfirmOpen(false);
  }

  return (
    <PermissionGate permission="manageQuotes">
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
