import { FormControl, InputLabel, MenuItem, Select } from '@mui/material';
import type { SupplierInvoiceSummaryStatus } from '@/api/generated/models/supplierInvoiceSummaryStatus';
import { useTranslation } from 'react-i18next';

import { INVOICE_STATUS_OPTIONS } from '@/features/invoices/lib/invoicesFilters';

interface InvoiceStatusFilterProps {
  value: SupplierInvoiceSummaryStatus | 'ALL';
  onChange: (next: SupplierInvoiceSummaryStatus | 'ALL') => void;
}

export function InvoiceStatusFilter({
  value,
  onChange,
}: InvoiceStatusFilterProps) {
  const { t } = useTranslation('invoices');

  return (
    <FormControl size="small" sx={{ width: '100%', minWidth: 0 }}>
      <InputLabel id="invoice-status-filter">{t('statusFilter.label')}</InputLabel>
      <Select
        labelId="invoice-status-filter"
        label={t('statusFilter.label')}
        value={value}
        onChange={(event) => {
          onChange(event.target.value as SupplierInvoiceSummaryStatus | 'ALL');
        }}
      >
        {INVOICE_STATUS_OPTIONS.map((status) => (
          <MenuItem key={status} value={status}>
            {status === 'ALL'
              ? t('statusFilter.all')
              : t(`statusFilter.${status.toLowerCase()}`, {
                  defaultValue: status,
                })}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
