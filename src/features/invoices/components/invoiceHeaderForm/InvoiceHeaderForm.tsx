import { useCallback, useEffect, useState } from 'react';
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
} from '@mui/material';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import { useTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';

import type { PatchCompaniesCompanyIdInvoicesInvoiceIdBody } from '@/api/generated/models/patchCompaniesCompanyIdInvoicesInvoiceIdBody';
import type { SupplierInvoice } from '@/api/generated/models/supplierInvoice';
import { useUpdateInvoiceMutation } from '@/api/endpoints/invoicesApi';
import { ApiErrorAlert } from '@/components/feedback/apiErrorAlert/ApiErrorAlert';
import { requestIdsFromInvoiceLines } from '@/features/invoices/lib/invoicesFilters';

interface InvoiceHeaderEditProps {
  companyId: string;
  invoice: SupplierInvoice;
  quoteIds?: string[];
}

function useInvoiceHeaderSave(
  companyId: string,
  invoice: SupplierInvoice,
  quoteIds?: string[],
) {
  const { t } = useTranslation('invoices');
  const { enqueueSnackbar } = useSnackbar();
  const [updateInvoice, updateState] = useUpdateInvoiceMutation();

  const save = useCallback(
    async (
      patch: PatchCompaniesCompanyIdInvoicesInvoiceIdBody,
    ): Promise<void> => {
      await updateInvoice({
        companyId,
        invoiceId: invoice.id,
        requestIds: requestIdsFromInvoiceLines(invoice.lines),
        quoteIds,
        ...patch,
      }).unwrap();
      enqueueSnackbar(t('toast.updated'), { variant: 'success' });
    },
    [
      companyId,
      enqueueSnackbar,
      invoice.id,
      invoice.lines,
      quoteIds,
      t,
      updateInvoice,
    ],
  );

  return {
    save,
    error: updateState.error,
    isLoading: updateState.isLoading,
  };
}

export function InvoiceNumberEditButton({
  companyId,
  invoice,
  quoteIds,
}: InvoiceHeaderEditProps) {
  const { t } = useTranslation(['invoices', 'validation']);
  const { save, error, isLoading } = useInvoiceHeaderSave(
    companyId,
    invoice,
    quoteIds,
  );
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(invoice.number ?? '');
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setDraft(invoice.number ?? '');
      setLocalError(null);
    }
  }, [open, invoice.number]);

  async function handleSave() {
    const trimmed = draft.trim();
    if (!trimmed) {
      setLocalError(t('validation:required'));
      return;
    }

    if (trimmed === invoice.number) {
      setOpen(false);
      return;
    }

    await save({ number: trimmed });
    setOpen(false);
  }

  return (
    <>
      <Tooltip title={t('form.editNumber')}>
        <IconButton
          size="small"
          aria-label={t('form.editNumber')}
          onClick={() => setOpen(true)}
          disabled={isLoading}
        >
          <EditOutlinedIcon fontSize="small" />
        </IconButton>
      </Tooltip>

      <Dialog
        open={open}
        onClose={() => !isLoading && setOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>{t('form.editNumber')}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <ApiErrorAlert error={error} />
            <TextField
              label={t('form.invoiceNumber')}
              fullWidth
              autoFocus
              value={draft}
              onChange={(event) => {
                setDraft(event.target.value);
                setLocalError(null);
              }}
              error={Boolean(localError)}
              helperText={localError}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault();
                  void handleSave();
                }
              }}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)} disabled={isLoading}>
            {t('actions.cancel')}
          </Button>
          <Button
            variant="contained"
            onClick={() => void handleSave()}
            disabled={isLoading}
          >
            {t('actions.save')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export function InvoiceNotesEditButton({
  companyId,
  invoice,
  quoteIds,
}: InvoiceHeaderEditProps) {
  const { t } = useTranslation('invoices');
  const { save, error, isLoading } = useInvoiceHeaderSave(
    companyId,
    invoice,
    quoteIds,
  );
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(invoice.notes ?? '');

  useEffect(() => {
    if (open) {
      setDraft(invoice.notes ?? '');
    }
  }, [open, invoice.notes]);

  async function handleSave() {
    const next = draft.trim() ? draft : null;
    if (next === (invoice.notes ?? null)) {
      setOpen(false);
      return;
    }

    await save({ notes: next });
    setOpen(false);
  }

  return (
    <>
      <Tooltip title={t('form.editNotes')}>
        <IconButton
          size="small"
          aria-label={t('form.editNotes')}
          onClick={() => setOpen(true)}
          disabled={isLoading}
        >
          <EditOutlinedIcon fontSize="small" />
        </IconButton>
      </Tooltip>

      <Dialog
        open={open}
        onClose={() => !isLoading && setOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>{t('form.editNotes')}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <ApiErrorAlert error={error} />
            <TextField
              label={t('form.notes')}
              fullWidth
              multiline
              minRows={3}
              autoFocus
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)} disabled={isLoading}>
            {t('actions.cancel')}
          </Button>
          <Button
            variant="contained"
            onClick={() => void handleSave()}
            disabled={isLoading}
          >
            {t('actions.save')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
