import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
import SendOutlinedIcon from '@mui/icons-material/SendOutlined';
import { useTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';

import type { SupplierQuoteStatus } from '@/api/generated/models/supplierQuoteStatus';
import {
  useDeleteQuoteMutation,
  useSubmitQuoteMutation,
} from '@/api/endpoints/quotesApi';
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
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [submitConfirmOpen, setSubmitConfirmOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const [submitQuote, submitState] = useSubmitQuoteMutation();
  const [deleteQuote, deleteState] = useDeleteQuoteMutation();

  if (status !== 'DRAFT') {
    return null;
  }

  async function handleSubmit() {
    await submitQuote({ companyId, quoteId, materialRequestId }).unwrap();
    enqueueSnackbar(t('toast.submitted'), { variant: 'success' });
    setSubmitConfirmOpen(false);
  }

  async function handleDelete() {
    await deleteQuote({ companyId, quoteId, materialRequestId }).unwrap();
    enqueueSnackbar(t('toast.deleted'), { variant: 'success' });
    setDeleteConfirmOpen(false);
    navigate('/app/quotes');
  }

  return (
    <PermissionGate permission="manageQuotes">
      <Stack direction="row" spacing={1}>
        <Button
          variant="contained"
          startIcon={<SendOutlinedIcon />}
          onClick={() => setSubmitConfirmOpen(true)}
        >
          {t('actions.submit')}
        </Button>
        <Button
          variant="outlined"
          color="error"
          startIcon={<DeleteOutlineOutlinedIcon />}
          onClick={() => setDeleteConfirmOpen(true)}
        >
          {t('actions.delete')}
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
            startIcon={<SendOutlinedIcon />}
            onClick={() => void handleSubmit()}
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
