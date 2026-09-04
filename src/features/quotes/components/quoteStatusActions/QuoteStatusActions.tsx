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
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import SendOutlinedIcon from '@mui/icons-material/SendOutlined';
import UndoOutlinedIcon from '@mui/icons-material/UndoOutlined';
import { useTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';

import type { SupplierQuoteStatus } from '@/api/generated/models/supplierQuoteStatus';
import {
  useDeleteQuoteMutation,
  useRejectQuoteMutation,
  useSubmitQuoteMutation,
  useUnrejectQuoteMutation,
  useUnsubmitQuoteMutation,
} from '@/api/endpoints/quotesApi';
import { ApiErrorAlert } from '@/components/feedback/apiErrorAlert/ApiErrorAlert';
import { DocumentActionMenuItem } from '@/layouts/documentDetailLayout/DocumentDetailActionsMenu';
import { PermissionGate } from '@/components/auth/permissionGate/PermissionGate';

interface QuoteActionsProps {
  companyId: string;
  quoteId: string;
  materialRequestId?: string;
  status: SupplierQuoteStatus;
  hasSelections?: boolean;
  /** Buyer: reject/unreject. Supplier: unsubmit/delete/reject (no unreject). */
  actor?: 'supplier' | 'buyer';
}

interface QuoteHeaderActionsProps extends Omit<QuoteActionsProps, 'hasSelections'> {
  canCreateInvoice?: boolean;
}

/** Visible primary CTAs for the document header (Submit, Create invoice). */
export function QuoteHeaderActions({
  companyId,
  quoteId,
  materialRequestId,
  status,
  canCreateInvoice = false,
}: QuoteHeaderActionsProps) {
  const { t } = useTranslation('quotes');
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [submitConfirmOpen, setSubmitConfirmOpen] = useState(false);
  const [submitQuote, submitState] = useSubmitQuoteMutation();

  const canSubmit = status === 'DRAFT';

  if (!canSubmit && !canCreateInvoice) {
    return null;
  }

  async function handleSubmit() {
    await submitQuote({ companyId, quoteId, materialRequestId }).unwrap();
    enqueueSnackbar(t('toast.submitted'), { variant: 'success' });
    setSubmitConfirmOpen(false);
  }

  return (
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      spacing={1}
      alignItems={{ xs: 'stretch', sm: 'center' }}
    >
      {canSubmit ? (
        <PermissionGate permission="manageQuotes">
          <Button
            variant="contained"
            size="small"
            startIcon={<SendOutlinedIcon />}
            onClick={() => setSubmitConfirmOpen(true)}
          >
            {t('actions.submit')}
          </Button>

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
        </PermissionGate>
      ) : null}

      {canCreateInvoice ? (
        <Button
          variant="contained"
          size="small"
          startIcon={<ReceiptLongOutlinedIcon />}
          onClick={() =>
            navigate(
              `/app/invoices/new?quoteId=${quoteId}${
                materialRequestId ? `&requestId=${materialRequestId}` : ''
              }`,
            )
          }
        >
          {t('actions.createInvoice')}
        </Button>
      ) : null}
    </Stack>
  );
}

/** Secondary quote actions for the header ⋮ menu (Unsubmit, Reject, Delete). */
export function QuoteStatusActions({
  companyId,
  quoteId,
  materialRequestId,
  status,
  hasSelections = false,
  actor = 'supplier',
}: QuoteActionsProps) {
  const { t } = useTranslation('quotes');
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [unsubmitConfirmOpen, setUnsubmitConfirmOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [unrejectOpen, setUnrejectOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  const [unsubmitQuote, unsubmitState] = useUnsubmitQuoteMutation();
  const [deleteQuote, deleteState] = useDeleteQuoteMutation();
  const [rejectQuote, rejectState] = useRejectQuoteMutation();
  const [unrejectQuote, unrejectState] = useUnrejectQuoteMutation();

  const isBuyer = actor === 'buyer';
  const canUnsubmit =
    !isBuyer && status === 'SUBMITTED' && !hasSelections;
  const canDelete =
    !isBuyer &&
    (status === 'DRAFT' || (status === 'SUBMITTED' && !hasSelections));
  const canReject = isBuyer
    ? (status === 'SUBMITTED' || status === 'PARTIALLY_ACCEPTED') &&
      !hasSelections
    : (status === 'DRAFT' || status === 'SUBMITTED') && !hasSelections;
  const canUnreject = isBuyer && status === 'REJECTED';

  if (!canUnsubmit && !canDelete && !canReject && !canUnreject) {
    return null;
  }

  async function handleUnsubmit() {
    await unsubmitQuote({ companyId, quoteId, materialRequestId }).unwrap();
    enqueueSnackbar(t('toast.unsubmitted'), { variant: 'success' });
    setUnsubmitConfirmOpen(false);
  }

  async function handleDelete() {
    await deleteQuote({ companyId, quoteId, materialRequestId }).unwrap();
    enqueueSnackbar(t('toast.deleted'), { variant: 'success' });
    setDeleteConfirmOpen(false);
    navigate('/app/quotes');
  }

  async function handleReject() {
    const reason = rejectionReason.trim();
    await rejectQuote({
      companyId,
      quoteId,
      materialRequestId,
      ...(reason ? { reason } : {}),
    }).unwrap();
    enqueueSnackbar(t('toast.rejected'), { variant: 'success' });
    setRejectOpen(false);
    setRejectionReason('');
  }

  async function handleUnreject() {
    await unrejectQuote({ companyId, quoteId, materialRequestId }).unwrap();
    enqueueSnackbar(t('toast.unrejected'), { variant: 'success' });
    setUnrejectOpen(false);
  }

  return (
    <PermissionGate permission="manageQuotes">
      {canUnsubmit ? (
        <DocumentActionMenuItem onClick={() => setUnsubmitConfirmOpen(true)}>
          <ListItemIcon>
            <UndoOutlinedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>{t('actions.unsubmit')}</ListItemText>
        </DocumentActionMenuItem>
      ) : null}
      {canReject ? (
        <DocumentActionMenuItem
          onClick={() => setRejectOpen(true)}
          sx={{ color: 'error.main' }}
        >
          <ListItemIcon sx={{ color: 'inherit' }}>
            <CloseOutlinedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>{t('actions.reject')}</ListItemText>
        </DocumentActionMenuItem>
      ) : null}
      {canUnreject ? (
        <DocumentActionMenuItem onClick={() => setUnrejectOpen(true)}>
          <ListItemIcon>
            <UndoOutlinedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>{t('actions.unreject')}</ListItemText>
        </DocumentActionMenuItem>
      ) : null}
      {canDelete ? (
        <DocumentActionMenuItem
          onClick={() => setDeleteConfirmOpen(true)}
          sx={{ color: 'error.main' }}
        >
          <ListItemIcon sx={{ color: 'inherit' }}>
            <DeleteOutlineOutlinedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>{t('actions.delete')}</ListItemText>
        </DocumentActionMenuItem>
      ) : null}

      <Dialog
        open={unsubmitConfirmOpen}
        onClose={() => setUnsubmitConfirmOpen(false)}
      >
        <DialogTitle>{t('confirm.unsubmitTitle')}</DialogTitle>
        <DialogContent>
          <ApiErrorAlert error={unsubmitState.error} />
          <Typography>{t('confirm.unsubmitMessage')}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUnsubmitConfirmOpen(false)}>
            {t('actions.cancel')}
          </Button>
          <Button
            variant="contained"
            startIcon={<UndoOutlinedIcon />}
            onClick={() => void handleUnsubmit()}
            disabled={unsubmitState.isLoading}
          >
            {t('actions.unsubmit')}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={rejectOpen}
        onClose={() => {
          setRejectOpen(false);
          setRejectionReason('');
        }}
      >
        <DialogTitle>{t('confirm.rejectTitle')}</DialogTitle>
        <DialogContent>
          <ApiErrorAlert error={rejectState.error} />
          <Typography sx={{ mb: 2 }}>{t('confirm.rejectMessage')}</Typography>
          <TextField
            fullWidth
            multiline
            minRows={3}
            label={t('confirm.rejectReason')}
            value={rejectionReason}
            onChange={(event) => setRejectionReason(event.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setRejectOpen(false);
              setRejectionReason('');
            }}
          >
            {t('actions.cancel')}
          </Button>
          <Button
            color="error"
            variant="contained"
            onClick={() => void handleReject()}
            disabled={rejectState.isLoading}
          >
            {t('actions.reject')}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={unrejectOpen} onClose={() => setUnrejectOpen(false)}>
        <DialogTitle>{t('confirm.unrejectTitle')}</DialogTitle>
        <DialogContent>
          <ApiErrorAlert error={unrejectState.error} />
          <Typography>{t('confirm.unrejectMessage')}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUnrejectOpen(false)}>
            {t('actions.cancel')}
          </Button>
          <Button
            variant="contained"
            startIcon={<UndoOutlinedIcon />}
            onClick={() => void handleUnreject()}
            disabled={unrejectState.isLoading}
          >
            {t('actions.unreject')}
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
