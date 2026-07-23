import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';

import {
  useCreateQuoteMutation,
  useListQuotesQuery,
} from '@/api/endpoints/quotesApi';
import { useRejectInboundRequestMutation } from '@/api/endpoints/requestsApi';
import { ApiErrorAlert } from '@/components/ApiErrorAlert';
import { PermissionGate } from '@/components/PermissionGate';

interface InboundRequestStatusActionsProps {
  companyId: string;
  requestId: string;
}

export function InboundRequestStatusActions({
  companyId,
  requestId,
}: InboundRequestStatusActionsProps) {
  const { t } = useTranslation('requests');
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const quotesQuery = useListQuotesQuery(
    { companyId, requestId, limit: 1, offset: 0 },
    { skip: !companyId || !requestId },
  );

  const [createQuote, createState] = useCreateQuoteMutation();
  const [rejectInboundRequest, rejectState] = useRejectInboundRequestMutation();

  const existingQuote = quotesQuery.data?.quotes[0];

  async function handleCreateQuote() {
    setIsCreating(true);
    try {
      const result = await createQuote({ companyId, requestId }).unwrap();
      enqueueSnackbar(t('inbound.toast.quoteCreated'), { variant: 'success' });
      navigate(`/app/quotes/${result.quote.id}`);
    } finally {
      setIsCreating(false);
    }
  }

  async function handleReject() {
    await rejectInboundRequest({
      companyId,
      requestId,
      reason: rejectionReason.trim() || undefined,
    }).unwrap();

    enqueueSnackbar(t('inbound.toast.rejected'), { variant: 'success' });
    setRejectOpen(false);
    setRejectionReason('');
    navigate('/app/requests?tab=inbound');
  }

  if (existingQuote) {
    return (
      <Button
        variant="contained"
        onClick={() => navigate(`/app/quotes/${existingQuote.id}`)}
      >
        {t('inbound.actions.openQuote')}
      </Button>
    );
  }

  return (
    <PermissionGate permission="manageQuotes">
      <Stack direction="row" spacing={1}>
        <Button
          variant="contained"
          onClick={() => void handleCreateQuote()}
          disabled={isCreating || createState.isLoading}
        >
          {t('inbound.actions.createQuote')}
        </Button>
        <Button
          variant="outlined"
          color="error"
          onClick={() => setRejectOpen(true)}
        >
          {t('inbound.actions.reject')}
        </Button>
      </Stack>

      <ApiErrorAlert error={createState.error} />

      <Dialog open={rejectOpen} onClose={() => setRejectOpen(false)}>
        <DialogTitle>{t('inbound.reject.title')}</DialogTitle>
        <DialogContent>
          <ApiErrorAlert error={rejectState.error} />
          <Typography sx={{ mb: 2 }}>{t('inbound.reject.message')}</Typography>
          <TextField
            fullWidth
            multiline
            minRows={3}
            label={t('inbound.reject.reason')}
            value={rejectionReason}
            onChange={(event) => setRejectionReason(event.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRejectOpen(false)}>
            {t('actions.cancel')}
          </Button>
          <Button
            color="error"
            variant="contained"
            onClick={() => void handleReject()}
            disabled={rejectState.isLoading}
          >
            {t('inbound.actions.reject')}
          </Button>
        </DialogActions>
      </Dialog>
    </PermissionGate>
  );
}
