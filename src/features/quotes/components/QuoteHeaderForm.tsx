import { useCallback } from 'react';
import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Typography,
} from '@mui/material';
import EventOutlinedIcon from '@mui/icons-material/EventOutlined';
import NotesOutlinedIcon from '@mui/icons-material/NotesOutlined';
import PaymentsOutlinedIcon from '@mui/icons-material/PaymentsOutlined';
import { useTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';

import type { PatchCompaniesCompanyIdQuotesQuoteIdBody } from '@/api/generated/models/patchCompaniesCompanyIdQuotesQuoteIdBody';
import type { SupplierQuote } from '@/api/generated/models/supplierQuote';
import { useUpdateQuoteMutation } from '@/api/endpoints/quotesApi';
import { ApiErrorAlert } from '@/components/ApiErrorAlert';
import { AutosaveTextField } from '@/components/AutosaveTextField';
import { currencySelectOptions } from '@/lib/currencies';

interface QuoteHeaderFieldsProps {
  companyId: string;
  quote: SupplierQuote;
  editable: boolean;
}

function toDateInputValue(iso: string | null | undefined): string {
  if (!iso) {
    return '';
  }
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return '';
  }
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function todayDateInputValue(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/** Local calendar date → ISO at end of that local day. */
function toEndOfDayIso(dateInput: string): string {
  const [year, month, day] = dateInput.split('-').map(Number);
  const end = new Date(year, month - 1, day, 23, 59, 59, 999);
  return end.toISOString();
}

function useQuoteHeaderSave(companyId: string, quote: SupplierQuote) {
  const { t } = useTranslation('quotes');
  const { enqueueSnackbar } = useSnackbar();
  const [updateQuote, updateState] = useUpdateQuoteMutation();

  const save = useCallback(
    async (patch: PatchCompaniesCompanyIdQuotesQuoteIdBody): Promise<void> => {
      await updateQuote({
        companyId,
        quoteId: quote.id,
        materialRequestId: quote.materialRequestId,
        ...patch,
      }).unwrap();
      enqueueSnackbar(t('toast.updated'), { variant: 'success' });
    },
    [
      companyId,
      enqueueSnackbar,
      quote.id,
      quote.materialRequestId,
      t,
      updateQuote,
    ],
  );

  return { save, error: updateState.error };
}

export function QuoteCurrencyValidUntilFields({
  companyId,
  quote,
  editable,
}: QuoteHeaderFieldsProps) {
  const { t } = useTranslation('quotes');
  const { save, error } = useQuoteHeaderSave(companyId, quote);
  const currencyOptions = currencySelectOptions(quote.currency);
  const validUntilDate = toDateInputValue(quote.validUntil);
  const minDate = todayDateInputValue();

  if (!editable) {
    return (
      <Stack spacing={1}>
        <ApiErrorAlert error={error} />
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          useFlexGap
          flexWrap="wrap"
        >
          <Stack direction="row" spacing={1} alignItems="center">
            <PaymentsOutlinedIcon fontSize="small" color="action" />
            <Typography variant="body2" color="text.secondary">
              {t('form.currency')}: {quote.currency}
            </Typography>
          </Stack>
          {quote.validUntil ? (
            <Stack direction="row" spacing={1} alignItems="center">
              <EventOutlinedIcon fontSize="small" color="action" />
              <Typography variant="body2" color="text.secondary">
                {t('form.validUntil')}:{' '}
                {new Date(quote.validUntil).toLocaleDateString()}
              </Typography>
            </Stack>
          ) : null}
        </Stack>
      </Stack>
    );
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
            await save({ validUntil: toEndOfDayIso(next) });
          }}
        />
      </Stack>
    </Stack>
  );
}

export function QuoteNotesField({
  companyId,
  quote,
  editable,
}: QuoteHeaderFieldsProps) {
  const { t } = useTranslation('quotes');
  const { save, error } = useQuoteHeaderSave(companyId, quote);

  if (!editable) {
    if (!quote.notes) {
      return null;
    }

    return (
      <Stack spacing={1}>
        <Stack direction="row" spacing={1} alignItems="center">
          <NotesOutlinedIcon fontSize="small" color="action" />
          <Typography variant="subtitle2">{t('form.notes')}</Typography>
        </Stack>
        <Typography variant="body2" color="text.secondary" whiteSpace="pre-wrap">
          {quote.notes}
        </Typography>
      </Stack>
    );
  }

  return (
    <Box>
      <ApiErrorAlert error={error} />
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
    </Box>
  );
}
