import { FormControl, InputLabel, MenuItem, Select } from '@mui/material';
import { useTranslation } from 'react-i18next';

import { currencySelectOptions } from '@/lib/currencies';

interface QuoteCurrencyFilterProps {
  value: string | null;
  onChange: (next: string | null) => void;
}

export function QuoteCurrencyFilter({
  value,
  onChange,
}: QuoteCurrencyFilterProps) {
  const { t } = useTranslation('quotes');
  const currencyOptions = currencySelectOptions(value);

  return (
    <FormControl size="small" sx={{ width: '100%', minWidth: 0 }}>
      <InputLabel id="quote-currency-filter">{t('filters.currency')}</InputLabel>
      <Select
        labelId="quote-currency-filter"
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
