import { useState } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
} from '@mui/material';
import { useTranslation } from 'react-i18next';

import { useListRequestsQuery } from '@/api/endpoints/requestsApi';
import { ApiErrorAlert } from '@/components/ApiErrorAlert';
import { useAppSelector } from '@/hooks/useAppSelector';
import { useCreateInvoiceFromQuote } from '@/features/invoices/hooks/useCreateInvoiceFromQuote';

interface InvoiceCreateDialogProps {
  open: boolean;
  onClose: () => void;
  initialRequestId?: string | null;
}

const ORDERABLE_STATUSES = new Set(['PARTIALLY_ORDERED', 'ORDERED', 'QUOTING']);

export function InvoiceCreateDialog({
  open,
  onClose,
  initialRequestId,
}: InvoiceCreateDialogProps) {
  const { t } = useTranslation('invoices');
  const companyId = useAppSelector((state) => state.auth.activeCompanyId);
  const [requestId, setRequestId] = useState(initialRequestId ?? '');

  const requestsQuery = useListRequestsQuery(
    { companyId: companyId ?? '', limit: 100, offset: 0 },
    { skip: !companyId || !open },
  );

  const { createInvoiceFromQuote, isCreating, error } =
    useCreateInvoiceFromQuote();

  const orderableRequests =
    requestsQuery.data?.requests.filter((request) =>
      ORDERABLE_STATUSES.has(request.status),
    ) ?? [];

  async function handleCreate() {
    if (!requestId) {
      return;
    }

    await createInvoiceFromQuote(requestId);
    onClose();
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{t('create.title')}</DialogTitle>
      <DialogContent>
        <ApiErrorAlert error={error} />
        <Stack spacing={2} sx={{ pt: 1 }}>
          <FormControl fullWidth>
            <InputLabel id="invoice-request-label">
              {t('create.request')}
            </InputLabel>
            <Select
              labelId="invoice-request-label"
              label={t('create.request')}
              value={requestId}
              onChange={(event) => setRequestId(event.target.value)}
            >
              {orderableRequests.map((request) => (
                <MenuItem key={request.id} value={request.id}>
                  {request.title ?? request.reference ?? request.id.slice(0, 8)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t('actions.dismiss')}</Button>
        <Button
          variant="contained"
          onClick={handleCreate}
          disabled={!requestId || isCreating}
        >
          {t('actions.create')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
