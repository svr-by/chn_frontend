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
  TextField,
  Typography,
} from '@mui/material';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import OpenInNewOutlinedIcon from '@mui/icons-material/OpenInNewOutlined';
import RequestQuoteOutlinedIcon from '@mui/icons-material/RequestQuoteOutlined';
import { useTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';

import { useListQuotesQuery } from '@/api/endpoints/quotesApi';
import { useRejectInboundRequestMutation } from '@/api/endpoints/requestsApi';
import { ApiErrorAlert } from '@/components/ApiErrorAlert';
import { DocumentActionMenuItem } from '@/layouts/documentDetailLayout/DocumentDetailActionsMenu';
import { PermissionGate } from '@/components/PermissionGate';
import { CreateQuoteFromInboundDialog } from '@/features/quotes/components/createQuoteFromInboundDialog/CreateQuoteFromInboundDialog';

interface InboundRequestStatusActionsProps {
  companyId: string;
  requestId: string;
  requestTitle: string;
  buyerName?: string;
}

export function InboundRequestStatusActions({
  companyId,
  requestId,
  requestTitle,
  buyerName,
}: InboundRequestStatusActionsProps) {
  const { t } = useTranslation('requests');
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [rejectOpen, setRejectOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  const quotesQuery = useListQuotesQuery(
    { companyId, requestId, limit: 1, offset: 0, direction: 'outbound' },
    { skip: !companyId || !requestId },
  );

  const [rejectInboundRequest, rejectState] = useRejectInboundRequestMutation();

  const existingQuote = quotesQuery.data?.quotes[0];

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
      <DocumentActionMenuItem
        onClick={() => navigate(`/app/quotes/${existingQuote.id}`)}
      >
        <ListItemIcon>
          <OpenInNewOutlinedIcon fontSize="small" />
        </ListItemIcon>
        <ListItemText>{t('inbound.actions.openQuote')}</ListItemText>
      </DocumentActionMenuItem>
    );
  }

  return (
    <PermissionGate permission="manageQuotes">
      <DocumentActionMenuItem onClick={() => setCreateOpen(true)}>
        <ListItemIcon>
          <RequestQuoteOutlinedIcon fontSize="small" />
        </ListItemIcon>
        <ListItemText>{t('inbound.actions.createQuote')}</ListItemText>
      </DocumentActionMenuItem>
      <DocumentActionMenuItem
        onClick={() => setRejectOpen(true)}
        sx={{ color: 'error.main' }}
      >
        <ListItemIcon sx={{ color: 'inherit' }}>
          <CloseOutlinedIcon fontSize="small" />
        </ListItemIcon>
        <ListItemText>{t('inbound.actions.reject')}</ListItemText>
      </DocumentActionMenuItem>

      <CreateQuoteFromInboundDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        companyId={companyId}
        lockedRequest={{
          id: requestId,
          title: requestTitle,
          buyerName,
        }}
      />

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
