import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
} from '@mui/material';
import { useTranslation } from 'react-i18next';

import type { SupplierQuote } from '@/api/generated/models/supplierQuote';
import { ApiErrorAlert } from '@/components/ApiErrorAlert';
import { AutosaveTextField } from '@/components/AutosaveTextField';
import { useQuoteHeaderSave } from '@/features/quotes/hooks/useQuoteHeaderSave';
import { currencySelectOptions } from '@/lib/currencies';
import {
  dateInputToIsoEndOfDay,
  isoToDateInputValue,
  todayDateInputValue,
} from '@/lib/dateInput';

export interface QuoteHeaderFormProps {
  companyId: string;
  quote: SupplierQuote;
  editable: boolean;
}

export function QuoteHeaderForm({
  companyId,
  quote,
  editable,
}: QuoteHeaderFormProps) {
  const { t } = useTranslation('quotes');
  const { save, error } = useQuoteHeaderSave(companyId, quote);
  const currencyOptions = currencySelectOptions(quote.currency);
  const validUntilDate = isoToDateInputValue(quote.validUntil);
  const minDate = todayDateInputValue();

  if (!editable) {
    return null;
  }

  return (
    <Stack spacing={1.5}>
      <ApiErrorAlert error={error} />
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={1.5}
        alignItems={{ sm: 'flex-start' }}
      >
        <FormControl sx={{ width: { xs: '100%', sm: 160 } }} size="small">
          <InputLabel id="quote-currency-label">{t('form.currency')}</InputLabel>
          <Select
            labelId="quote-currency-label"
            label={t('form.currency')}
            value={quote.currency}
            onChange={(event) => {
              const next = event.target.value;
              if (next === quote.currency) {
                return;
              }
              void save({ currency: next });
            }}
          >
            {currencyOptions.map((code) => (
              <MenuItem key={code} value={code}>
                {code}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <AutosaveTextField
          label={t('form.validUntil')}
          type="date"
          size="small"
          InputLabelProps={{ shrink: true }}
          inputProps={{ min: minDate }}
          sx={{ width: { xs: '100%', sm: 200 } }}
          value={validUntilDate}
          onCommit={async (next) => {
            if (!next) {
              await save({ validUntil: null });
              return;
            }
            if (next < minDate) {
              throw new Error('past-date');
            }
            await save({ validUntil: dateInputToIsoEndOfDay(next) });
          }}
        />
      </Stack>

      <AutosaveTextField
        label={t('form.notes')}
        fullWidth
        multiline
        minRows={2}
        size="small"
        value={quote.notes ?? ''}
        onCommit={async (next) => {
          await save({ notes: next.trim() ? next : null });
        }}
      />
    </Stack>
  );
}
