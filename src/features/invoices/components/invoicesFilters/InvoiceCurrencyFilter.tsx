import { FormControl, InputLabel, MenuItem, Select } from '@mui/material';
import { useTranslation } from 'react-i18next';

import { currencySelectOptions } from '@/lib/currencies';

interface InvoiceCurrencyFilterProps {
  value: string | null;
  onChange: (next: string | null) => void;
}

export function InvoiceCurrencyFilter({
  value,
  onChange,
}: InvoiceCurrencyFilterProps) {
  const { t } = useTranslation('invoices');
  const currencyOptions = currencySelectOptions(value);

  return (
    <FormControl size="small" sx={{ minWidth: 160 }}>
      <InputLabel id="invoice-currency-filter">{t('filters.currency')}</InputLabel>
      <Select
        labelId="invoice-currency-filter"
        label={t('filters.currency')}
        value={value ?? ''}
        onChange={(event) => {
          const next = event.target.value;
          onChange(next ? next : null);
        }}
      >
        <MenuItem value="">{t('filters.placeholders.currency')}</MenuItem>
        {currencyOptions.map((code) => (
          <MenuItem key={code} value={code}>
            {code}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
