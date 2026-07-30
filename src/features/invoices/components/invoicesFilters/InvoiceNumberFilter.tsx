import { TextField } from '@mui/material';
import { useTranslation } from 'react-i18next';

interface InvoiceNumberFilterProps {
  value: string;
  onChange: (next: string) => void;
}

export function InvoiceNumberFilter({
  value,
  onChange,
}: InvoiceNumberFilterProps) {
  const { t } = useTranslation('invoices');

  return (
    <TextField
      size="small"
      label={t('filters.invoiceNumber')}
      placeholder={t('filters.placeholders.invoiceNumber')}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      sx={{ minWidth: 180 }}
      inputProps={{ autoComplete: 'off' }}
    />
  );
}
