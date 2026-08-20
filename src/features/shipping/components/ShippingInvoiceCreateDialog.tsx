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

import type { SupplierInvoiceSummaryStatus } from '@/api/generated/models/supplierInvoiceSummaryStatus';
import { useListInvoicesQuery } from '@/api/endpoints/invoicesApi';
import { ApiErrorAlert } from '@/components/feedback/apiErrorAlert/ApiErrorAlert';
import { useAppSelector } from '@/hooks/useAppSelector';
import { useCreateShippingInvoiceFromInvoice } from '@/features/shipping/hooks/useCreateShippingInvoiceFromInvoice';

interface ShippingInvoiceCreateDialogProps {
  open: boolean;
  onClose: () => void;
  initialSupplierInvoiceId?: string | null;
}

const SHIPPABLE_INVOICE_STATUSES = new Set<SupplierInvoiceSummaryStatus>([
  'ISSUED',
  'PARTIALLY_PAID',
  'PAID',
  'CONFIRMED',
]);

export function ShippingInvoiceCreateDialog({
  open,
  onClose,
  initialSupplierInvoiceId,
}: ShippingInvoiceCreateDialogProps) {
  const { t } = useTranslation('shipping');
  const companyId = useAppSelector((state) => state.auth.activeCompanyId);
  const [invoiceId, setInvoiceId] = useState(initialSupplierInvoiceId ?? '');

  const invoicesQuery = useListInvoicesQuery(
    {
      companyId: companyId ?? '',
      limit: 100,
      offset: 0,
      direction: 'outbound',
    },
    { skip: !companyId || !open },
  );

  const { createShippingInvoiceFromInvoice, isCreating, error } =
    useCreateShippingInvoiceFromInvoice();

  const shippableInvoices =
    invoicesQuery.data?.invoices.filter((invoice) =>
      SHIPPABLE_INVOICE_STATUSES.has(invoice.status),
    ) ?? [];

  async function handleCreate() {
    if (!invoiceId) {
      return;
    }

    await createShippingInvoiceFromInvoice(invoiceId);
    onClose();
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{t('create.title')}</DialogTitle>
      <DialogContent>
        <ApiErrorAlert error={error} />
        <Stack spacing={2} sx={{ pt: 1 }}>
          <FormControl fullWidth>
            <InputLabel id="shipping-invoice-label">
              {t('create.supplierInvoice')}
            </InputLabel>
            <Select
              labelId="shipping-invoice-label"
              label={t('create.supplierInvoice')}
              value={invoiceId}
              onChange={(event) => setInvoiceId(event.target.value)}
            >
              {shippableInvoices.map((invoice) => (
                <MenuItem key={invoice.id} value={invoice.id}>
                  {invoice.number ||
                    `${t('create.invoiceFallback', { id: invoice.id.slice(0, 8) })}`}
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
          disabled={!invoiceId || isCreating}
        >
          {t('actions.create')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
