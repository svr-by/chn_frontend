import { Autocomplete, TextField } from '@mui/material';
import type { GetCompaniesCompanyIdInvoicesDirection } from '@/api/generated/models/getCompaniesCompanyIdInvoicesDirection';
import type { TradingPartner } from '@/api/generated/models/tradingPartner';
import { useTranslation } from 'react-i18next';

interface InvoiceCounterpartyAutocompleteProps {
  direction: GetCompaniesCompanyIdInvoicesDirection;
  value: string | null;
  options: TradingPartner[];
  loading: boolean;
  onChange: (nextId: string | null) => void;
}

export function InvoiceCounterpartyAutocomplete({
  direction,
  value,
  options,
  loading,
  onChange,
}: InvoiceCounterpartyAutocompleteProps) {
  const { t } = useTranslation('invoices');

  const label =
    direction === 'inbound' ? t('filters.supplier') : t('filters.buyer');
  const placeholder = t('filters.placeholders.company');

  const selectedOption =
    value == null ? null : (options.find((p) => p.company.id === value) ?? null);

  return (
    <Autocomplete
      size="small"
      options={options}
      value={selectedOption}
      onChange={(_event, next) => onChange(next?.company.id ?? null)}
      getOptionLabel={(option) => option.company.name}
      isOptionEqualToValue={(option, v) => option.company.id === v.company.id}
      loading={loading}
      clearOnEscape
      sx={{ minWidth: 220 }}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          placeholder={placeholder}
          inputProps={{
            ...params.inputProps,
            autoComplete: 'off',
          }}
        />
      )}
    />
  );
}
