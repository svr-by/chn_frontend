import { TextField } from '@mui/material';
import { useTranslation } from 'react-i18next';

interface QuoteNumberFilterProps {
  value: string;
  onChange: (next: string) => void;
}

export function QuoteNumberFilter({
  value,
  onChange,
}: QuoteNumberFilterProps) {
  const { t } = useTranslation('quotes');

  return (
    <TextField
      size="small"
      label={t('filters.quoteNumber')}
      placeholder={t('filters.placeholders.quoteNumber')}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      sx={{ width: '100%', minWidth: 0 }}
      slotProps={{
        input: {
          autoComplete: 'off',
        },
      }}
    />
  );
}
