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
  TextField,
} from '@mui/material';
import { useTranslation } from 'react-i18next';

import type { ConsolidationShippingInvoiceEntry } from '@/api/generated/models/consolidationShippingInvoiceEntry';
import type { ShippingInvoiceSummary } from '@/api/generated/models/shippingInvoiceSummary';
import { useAddConsolidationShippingInvoiceMutation } from '@/api/endpoints/consolidationsApi';
import { ApiErrorAlert } from '@/components/ApiErrorAlert';

interface ConsolidationShippingInvoiceAddDialogProps {
  open: boolean;
  onClose: () => void;
  companyId: string;
  consolidationId: string;
  existingEntries: ConsolidationShippingInvoiceEntry[];
  consolidatableInvoices: ShippingInvoiceSummary[];
}

export function ConsolidationShippingInvoiceAddDialog({
  open,
  onClose,
  companyId,
  consolidationId,
  existingEntries,
  consolidatableInvoices,
}: ConsolidationShippingInvoiceAddDialogProps) {
  const { t } = useTranslation('consolidations');
  const [shippingInvoiceId, setShippingInvoiceId] = useState('');
  const [notes, setNotes] = useState('');

  const [addShippingInvoice, addState] =
    useAddConsolidationShippingInvoiceMutation();

  const existingIds = new Set(
    existingEntries.map((entry) => entry.shippingInvoice.id),
  );
  const availableInvoices = consolidatableInvoices.filter(
    (invoice) => !existingIds.has(invoice.id),
  );

  async function handleAdd() {
    if (!shippingInvoiceId) {
      return;
    }

    await addShippingInvoice({
      companyId,
      consolidationId,
      shippingInvoiceId,
      ...(notes.trim() ? { notes: notes.trim() } : {}),
    }).unwrap();

    setShippingInvoiceId('');
    setNotes('');
    onClose();
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{t('addShippingInvoice.title')}</DialogTitle>
      <DialogContent>
        <ApiErrorAlert error={addState.error} />
        <Stack spacing={2} sx={{ pt: 1 }}>
          <FormControl fullWidth>
            <InputLabel id="add-shipping-invoice-label">
              {t('addShippingInvoice.shippingInvoice')}
            </InputLabel>
            <Select
              labelId="add-shipping-invoice-label"
              label={t('addShippingInvoice.shippingInvoice')}
              value={shippingInvoiceId}
              onChange={(event) => setShippingInvoiceId(event.target.value)}
            >
              {availableInvoices.map((invoice) => (
                <MenuItem key={invoice.id} value={invoice.id}>
                  {t('create.shippingInvoiceOption', {
                    id: invoice.id.slice(0, 8),
                    supplier: invoice.supplierCompany?.name ?? '—',
                    tracking: invoice.trackingNumber ?? '—',
                  })}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            label={t('form.notes')}
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            fullWidth
            multiline
            minRows={2}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t('actions.dismiss')}</Button>
        <Button
          variant="contained"
          onClick={handleAdd}
          disabled={
            addState.isLoading ||
            !shippingInvoiceId ||
            availableInvoices.length === 0
          }
        >
          {t('actions.addShippingInvoice')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
