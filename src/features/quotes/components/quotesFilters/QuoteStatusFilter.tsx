import { FormControl, InputLabel, MenuItem, Select } from '@mui/material';
import type { SupplierQuoteStatus } from '@/api/generated/models/supplierQuoteStatus';
import { useTranslation } from 'react-i18next';

import { QUOTE_STATUS_OPTIONS } from '@/features/quotes/lib/quotesFilters';

interface QuoteStatusFilterProps {
  value: SupplierQuoteStatus | 'ALL';
  onChange: (next: SupplierQuoteStatus | 'ALL') => void;
}

export function QuoteStatusFilter({
  value,
  onChange,
}: QuoteStatusFilterProps) {
  const { t } = useTranslation('quotes');

  return (
    <FormControl size="small" sx={{ width: '100%', minWidth: 0 }}>
      <InputLabel id="quote-status-filter">{t('statusFilter.label')}</InputLabel>
      <Select
        labelId="quote-status-filter"
        label={t('statusFilter.label')}
        value={value}
        onChange={(event) => {
          onChange(event.target.value as SupplierQuoteStatus | 'ALL');
        }}
      >
        {QUOTE_STATUS_OPTIONS.map((status) => (
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
