import { useEffect, useState } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Tooltip,
} from '@mui/material';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import { useTranslation } from 'react-i18next';

import type { SupplierQuote } from '@/api/generated/models/supplierQuote';
import { ApiErrorAlert } from '@/components/feedback/apiErrorAlert/ApiErrorAlert';
import { useQuoteHeaderSave } from '@/features/quotes/hooks/useQuoteHeaderSave';
import { currencySelectOptions } from '@/lib/currencies';
import {
  dateInputToIsoEndOfDay,
  isoToDateInputValue,
  todayDateInputValue,
} from '@/lib/dateInput';

interface QuoteHeaderEditProps {
  companyId: string;
  quote: SupplierQuote;
}

interface QuoteCurrencyEditButtonProps extends QuoteHeaderEditProps {
  disabled?: boolean;
}

export function QuoteNumberEditButton({
  companyId,
  quote,
}: QuoteHeaderEditProps) {
  const { t } = useTranslation('quotes');
  const { save, error, isLoading } = useQuoteHeaderSave(companyId, quote);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(quote.number ?? '');

  useEffect(() => {
    if (open) {
      setDraft(quote.number ?? '');
    }
  }, [open, quote.number]);

  async function handleSave() {
    const trimmed = draft.trim();
    const next = trimmed.length > 0 ? trimmed : null;
    if (next === (quote.number ?? null)) {
      setOpen(false);
      return;
    }

    if (trimmed.length === 0) {
      return;
    }

    await save({ number: trimmed });
    setOpen(false);
  }

  return (
    <>
      <Tooltip title={t('form.editNumber')}>
        <IconButton
          size="small"
          aria-label={t('form.editNumber')}
          onClick={() => setOpen(true)}
          disabled={isLoading}
        >
          <EditOutlinedIcon fontSize="small" />
        </IconButton>
      </Tooltip>

      <Dialog
        open={open}
        onClose={() => !isLoading && setOpen(false)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>{t('form.editNumber')}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <ApiErrorAlert error={error} />
            <TextField
              label={t('form.number')}
              size="small"
              fullWidth
              autoFocus
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)} disabled={isLoading}>
            {t('actions.cancel')}
          </Button>
          <Button
            variant="contained"
            onClick={() => void handleSave()}
            disabled={isLoading || draft.trim().length === 0}
          >
            {t('actions.save')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export function QuoteCurrencyEditButton({
  companyId,
  quote,
  disabled = false,
}: QuoteCurrencyEditButtonProps) {
  const { t } = useTranslation('quotes');
  const { save, error, isLoading } = useQuoteHeaderSave(companyId, quote);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(quote.currency);
  const currencyOptions = currencySelectOptions(quote.currency);
  const isDisabled = disabled || isLoading;
  const tooltipTitle = disabled
    ? t('form.editCurrencyDisabledHasSelections')
    : t('form.editCurrency');

  useEffect(() => {
    if (open) {
      setDraft(quote.currency);
    }
  }, [open, quote.currency]);

  async function handleSave() {
    if (draft === quote.currency) {
      setOpen(false);
      return;
    }

    await save({ currency: draft });
    setOpen(false);
  }

  return (
    <>
      <Tooltip title={tooltipTitle}>
        <span>
          <IconButton
            size="small"
            aria-label={t('form.editCurrency')}
            onClick={() => setOpen(true)}
            disabled={isDisabled}
          >
            <EditOutlinedIcon fontSize="small" />
          </IconButton>
        </span>
      </Tooltip>

      <Dialog
        open={open}
        onClose={() => !isLoading && setOpen(false)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>{t('form.editCurrency')}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <ApiErrorAlert error={error} />
            <FormControl size="small" fullWidth>
              <InputLabel id="quote-currency-edit-label">
                {t('form.currency')}
              </InputLabel>
              <Select
                labelId="quote-currency-edit-label"
                label={t('form.currency')}
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
              >
                {currencyOptions.map((code) => (
                  <MenuItem key={code} value={code}>
                    {code}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)} disabled={isLoading}>
            {t('actions.cancel')}
          </Button>
          <Button
            variant="contained"
            onClick={() => void handleSave()}
            disabled={isLoading}
          >
            {t('actions.save')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export function QuoteValidUntilEditButton({
  companyId,
  quote,
}: QuoteHeaderEditProps) {
  const { t } = useTranslation('quotes');
  const { save, error, isLoading } = useQuoteHeaderSave(companyId, quote);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(isoToDateInputValue(quote.validUntil));
  const minDate = todayDateInputValue();

  useEffect(() => {
    if (open) {
      setDraft(isoToDateInputValue(quote.validUntil));
    }
  }, [open, quote.validUntil]);

  async function handleSave() {
    const current = isoToDateInputValue(quote.validUntil);
    if (draft === current) {
      setOpen(false);
      return;
    }

    if (draft && draft < minDate) {
      return;
    }

    await save({
      validUntil: draft ? dateInputToIsoEndOfDay(draft) : null,
    });
    setOpen(false);
  }

  return (
    <>
      <Tooltip title={t('form.editValidUntil')}>
        <IconButton
          size="small"
          aria-label={t('form.editValidUntil')}
          onClick={() => setOpen(true)}
          disabled={isLoading}
        >
          <EditOutlinedIcon fontSize="small" />
        </IconButton>
      </Tooltip>

      <Dialog
        open={open}
        onClose={() => !isLoading && setOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>{t('form.editValidUntil')}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <ApiErrorAlert error={error} />
            <TextField
              label={t('form.validUntil')}
              type="date"
              size="small"
              fullWidth
              InputLabelProps={{ shrink: true }}
              inputProps={{ min: minDate }}
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              autoFocus
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)} disabled={isLoading}>
            {t('actions.cancel')}
          </Button>
          <Button
            variant="contained"
            onClick={() => void handleSave()}
            disabled={isLoading || Boolean(draft && draft < minDate)}
          >
            {t('actions.save')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export function QuoteNotesEditButton({
  companyId,
  quote,
}: QuoteHeaderEditProps) {
  const { t } = useTranslation('quotes');
  const { save, error, isLoading } = useQuoteHeaderSave(companyId, quote);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(quote.notes ?? '');

  useEffect(() => {
    if (open) {
      setDraft(quote.notes ?? '');
    }
  }, [open, quote.notes]);

  async function handleSave() {
    const next = draft.trim() ? draft : null;
    if (next === (quote.notes ?? null)) {
      setOpen(false);
      return;
    }

    await save({ notes: next });
    setOpen(false);
  }

  return (
    <>
      <Tooltip title={t('form.editNotes')}>
        <IconButton
          size="small"
          aria-label={t('form.editNotes')}
          onClick={() => setOpen(true)}
          disabled={isLoading}
        >
          <EditOutlinedIcon fontSize="small" />
        </IconButton>
      </Tooltip>

      <Dialog
        open={open}
        onClose={() => !isLoading && setOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>{t('form.editNotes')}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <ApiErrorAlert error={error} />
            <TextField
              label={t('form.notes')}
              fullWidth
              multiline
              minRows={3}
              autoFocus
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)} disabled={isLoading}>
            {t('actions.cancel')}
          </Button>
          <Button
            variant="contained"
            onClick={() => void handleSave()}
            disabled={isLoading}
          >
            {t('actions.save')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
