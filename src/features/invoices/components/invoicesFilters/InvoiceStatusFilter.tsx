import { FormControl, InputLabel, MenuItem, Select } from '@mui/material';
import type { GetCompaniesCompanyIdInvoicesDirection } from '@/api/generated/models/getCompaniesCompanyIdInvoicesDirection';
import type { SupplierInvoiceSummaryStatus } from '@/api/generated/models/supplierInvoiceSummaryStatus';
import { useTranslation } from 'react-i18next';

import { getInvoiceStatusOptions } from '@/features/invoices/lib/invoicesFilters';

interface InvoiceStatusFilterProps {
  direction: GetCompaniesCompanyIdInvoicesDirection;
  value: SupplierInvoiceSummaryStatus | 'ALL';
  onChange: (next: SupplierInvoiceSummaryStatus | 'ALL') => void;
}

export function InvoiceStatusFilter({
  direction,
  value,
  onChange,
}: InvoiceStatusFilterProps) {
  const { t } = useTranslation('invoices');
  const statusOptions = getInvoiceStatusOptions(direction);

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
        {statusOptions.map((status) => (
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
