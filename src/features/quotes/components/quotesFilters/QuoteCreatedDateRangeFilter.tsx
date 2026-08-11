import { Stack, TextField } from '@mui/material';
import { useTranslation } from 'react-i18next';

interface QuoteCreatedDateRangeFilterProps {
  createdFrom: string;
  createdTo: string;
  onChange: (next: { createdFrom: string; createdTo: string }) => void;
}

export function QuoteCreatedDateRangeFilter({
  createdFrom,
  createdTo,
  onChange,
}: QuoteCreatedDateRangeFilterProps) {
  const { t } = useTranslation('quotes');

  return (
    <Stack
      direction="row"
      spacing={1}
      alignItems="center"
      useFlexGap
      sx={{ width: '100%', flexWrap: 'nowrap', minWidth: 0 }}
    >
      <TextField
        label={t('filters.createdFrom')}
        type="date"
        size="small"
        value={createdFrom}
        InputLabelProps={{ shrink: true }}
        onChange={(event) => {
          onChange({ createdFrom: event.target.value, createdTo });
        }}
        sx={{ flex: 1, minWidth: 0 }}
      />
      <TextField
        label={t('filters.createdTo')}
        type="date"
        size="small"
        value={createdTo}
        InputLabelProps={{ shrink: true }}
        onChange={(event) => {
          onChange({ createdFrom, createdTo: event.target.value });
        }}
        sx={{ flex: 1, minWidth: 0 }}
      />
    </Stack>
  );
}
