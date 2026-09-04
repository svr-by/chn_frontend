import { useState } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import ThumbDownOffAltIcon from '@mui/icons-material/ThumbDownOffAlt';
import ThumbUpOffAltIcon from '@mui/icons-material/ThumbUpOffAlt';
import UndoOutlinedIcon from '@mui/icons-material/UndoOutlined';
import { useTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';

import {
  useDeleteQuoteLineSelectionMutation,
  usePutQuoteLineSelectionMutation,
  useRejectQuoteLineMutation,
  useUnrejectQuoteLineMutation,
} from '@/api/endpoints/quotesApi';
import { DecimalDisplay } from '@/components/dataDisplay/decimalDisplay/DecimalDisplay';
import { PermissionGate } from '@/components/auth/permissionGate/PermissionGate';
import { ApiErrorAlert } from '@/components/feedback/apiErrorAlert/ApiErrorAlert';
import { QuoteLineRejectedBadge } from '@/components/status/quoteLineRejectedBadge/QuoteLineRejectedBadge';
import { QuoteLineSelectionDialog } from '@/features/quotes/components/quoteLineSelection/QuoteLineSelectionDialog';
import { isQuoteLineRejected } from '@/lib/quoteLineRejected';

export interface QuoteOfferDecisionCellProps {
  companyId: string;
  quoteId: string;
  lineId: string;
  maxQuantity: string;
  selectedQuantity: string | null | undefined;
  rejectedAt: string | null | undefined;
  rejectionReason?: string | null;
  unit?: string | null;
  materialRequestId?: string;
  selectionEnabled?: boolean;
  allowReject?: boolean;
}

/**
 * Buyer decision UI for an offer:
 * - neutral: 👍 select + 👎 reject
 * - selected: qty + edit (no reject)
 * - rejected: badge (+ edit/unreject for buyer)
 */
export function QuoteOfferDecisionCell({
  companyId,
  quoteId,
  lineId,
  maxQuantity,
  selectedQuantity,
  rejectedAt,
  rejectionReason,
  unit,
  materialRequestId,
  selectionEnabled = false,
  allowReject = false,
}: QuoteOfferDecisionCellProps) {
  const { t } = useTranslation('quotes');
  const { enqueueSnackbar } = useSnackbar();
  const [selectionOpen, setSelectionOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [unrejectOpen, setUnrejectOpen] = useState(false);
  const [rejectionReasonDraft, setRejectionReasonDraft] = useState('');

  const [putSelection, putState] = usePutQuoteLineSelectionMutation();
  const [deleteSelection, deleteState] = useDeleteQuoteLineSelectionMutation();
  const [rejectLine, rejectState] = useRejectQuoteLineMutation();
  const [unrejectLine, unrejectState] = useUnrejectQuoteLineMutation();

  const isSelected = selectedQuantity != null;
  const isRejected = isQuoteLineRejected(rejectedAt);
  const canSelect = selectionEnabled && !isRejected && !isSelected;
  const canReject = allowReject && !isRejected && !isSelected;
  const canEditSelection = selectionEnabled && isSelected;
  const canEditRejection = allowReject && isRejected;

  async function handleSaveSelection(values: {
    quantity: string;
    notes: string | null;
  }) {
    await putSelection({
      companyId,
      quoteId,
      lineId,
      materialRequestId,
      quantity: values.quantity,
      notes: values.notes,
    }).unwrap();

    enqueueSnackbar(
      isSelected ? t('toast.selectionUpdated') : t('toast.selectionSaved'),
      { variant: 'success' },
    );
    setSelectionOpen(false);
  }

  async function handleDeleteSelection() {
    await deleteSelection({
      companyId,
      quoteId,
      lineId,
      materialRequestId,
    }).unwrap();

    enqueueSnackbar(t('toast.selectionRemoved'), { variant: 'success' });
    setSelectionOpen(false);
  }

  async function handleReject() {
    const reason = rejectionReasonDraft.trim();
    await rejectLine({
      companyId,
      quoteId,
      lineId,
      materialRequestId,
      ...(reason ? { reason } : {}),
    }).unwrap();
    enqueueSnackbar(t('toast.lineRejected'), { variant: 'success' });
    setRejectOpen(false);
    setRejectionReasonDraft('');
  }

  async function handleUnreject() {
    await unrejectLine({
      companyId,
      quoteId,
      lineId,
      materialRequestId,
    }).unwrap();
    enqueueSnackbar(t('toast.lineUnrejected'), { variant: 'success' });
    setUnrejectOpen(false);
  }

  if (isRejected) {
    return (
      <Stack
        direction="row"
        spacing={0.5}
        alignItems="center"
        justifyContent="flex-end"
        flexWrap="nowrap"
      >
        <QuoteLineRejectedBadge
          rejectedAt={rejectedAt}
          rejectionReason={rejectionReason}
        />
        {canEditRejection ? (
          <PermissionGate permission="manageQuotes">
            <Tooltip title={t('decision.editRejection')}>
              <IconButton
                size="small"
                aria-label={t('decision.editRejection')}
                onClick={() => setUnrejectOpen(true)}
              >
                <EditOutlinedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Dialog
              open={unrejectOpen}
              onClose={() => setUnrejectOpen(false)}
            >
              <DialogTitle>{t('confirm.unrejectLineTitle')}</DialogTitle>
              <DialogContent>
                <ApiErrorAlert error={unrejectState.error} />
                <Typography>{t('confirm.unrejectLineMessage')}</Typography>
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
                  {t('actions.unrejectLine')}
                </Button>
              </DialogActions>
            </Dialog>
          </PermissionGate>
        ) : null}
      </Stack>
    );
  }

  if (isSelected) {
    return (
      <PermissionGate
        permission="manageQuotes"
        fallback={
          <DecimalDisplay value={selectedQuantity} suffix={unit} />
        }
      >
        <Stack
          direction="row"
          spacing={0.5}
          alignItems="center"
          justifyContent="flex-end"
          flexWrap="nowrap"
        >
          <DecimalDisplay value={selectedQuantity} suffix={unit} />
          {canEditSelection ? (
            <Tooltip title={t('selection.edit')}>
              <IconButton
                size="small"
                aria-label={t('selection.edit')}
                onClick={() => setSelectionOpen(true)}
              >
                <EditOutlinedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          ) : null}
        </Stack>

        {canEditSelection ? (
          <QuoteLineSelectionDialog
            open={selectionOpen}
            onClose={() => setSelectionOpen(false)}
            title={t('selection.editTitle')}
            maxQuantity={maxQuantity}
            initialQuantity={selectedQuantity ?? maxQuantity}
            isSubmitting={putState.isLoading}
            error={putState.error}
            onSubmit={(values) => void handleSaveSelection(values)}
            allowRemove
            isRemoving={deleteState.isLoading}
            removeError={deleteState.error}
            onRemove={() => void handleDeleteSelection()}
          />
        ) : null}
      </PermissionGate>
    );
  }

  if (!canSelect && !canReject) {
    return (
      <Typography variant="body2" color="text.secondary">
        —
      </Typography>
    );
  }

  return (
    <PermissionGate permission="manageQuotes">
      <Stack
        direction="row"
        spacing={0.25}
        alignItems="center"
        justifyContent="flex-end"
        flexWrap="nowrap"
      >
        {canSelect ? (
          <Tooltip title={t('decision.select')}>
            <IconButton
              size="small"
              color="success"
              aria-label={t('decision.select')}
              onClick={() => setSelectionOpen(true)}
            >
              <ThumbUpOffAltIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        ) : null}
        {canReject ? (
          <Tooltip title={t('decision.reject')}>
            <IconButton
              size="small"
              color="error"
              aria-label={t('decision.reject')}
              onClick={() => setRejectOpen(true)}
            >
              <ThumbDownOffAltIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        ) : null}
      </Stack>

      {canSelect ? (
        <QuoteLineSelectionDialog
          open={selectionOpen}
          onClose={() => setSelectionOpen(false)}
          title={t('selection.selectTitle')}
          maxQuantity={maxQuantity}
          initialQuantity={selectedQuantity ?? maxQuantity}
          isSubmitting={putState.isLoading}
          error={putState.error}
          onSubmit={(values) => void handleSaveSelection(values)}
          allowRemove={false}
          isRemoving={false}
          removeError={undefined}
          onRemove={() => undefined}
        />
      ) : null}

      <Dialog
        open={rejectOpen}
        onClose={() => {
          setRejectOpen(false);
          setRejectionReasonDraft('');
        }}
      >
        <DialogTitle>{t('confirm.rejectLineTitle')}</DialogTitle>
        <DialogContent>
          <ApiErrorAlert error={rejectState.error} />
          <Typography sx={{ mb: 2 }}>{t('confirm.rejectLineMessage')}</Typography>
          <TextField
            fullWidth
            multiline
            minRows={3}
            label={t('confirm.rejectLineReason')}
            value={rejectionReasonDraft}
            onChange={(event) => setRejectionReasonDraft(event.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setRejectOpen(false);
              setRejectionReasonDraft('');
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
            {t('actions.rejectLine')}
          </Button>
        </DialogActions>
      </Dialog>
    </PermissionGate>
  );
}
