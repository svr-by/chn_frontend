import { useEffect, useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Alert,
  Autocomplete,
  Button,
  Checkbox,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  InputLabel,
  Link,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';

import type { InboundMaterialRequestSummary } from '@/api/generated/models/inboundMaterialRequestSummary';
import type { SupplierQuoteSummary } from '@/api/generated/models/supplierQuoteSummary';
import {
  useCreateQuoteMutation,
  useLazyListQuotesQuery,
} from '@/api/endpoints/quotesApi';
import { useListInboundRequestsQuery } from '@/api/endpoints/requestsApi';
import { ApiErrorAlert } from '@/components/ApiErrorAlert';
import { currencySelectOptions } from '@/lib/currencies';

export type LockedInboundRequest = {
  id: string;
  title: string;
  buyerName?: string;
};

interface CreateQuoteFromInboundDialogProps {
  open: boolean;
  onClose: () => void;
  companyId: string;
  lockedRequest?: LockedInboundRequest | null;
}

function requestOptionLabel(request: InboundMaterialRequestSummary): string {
  return `${request.title} · ${request.buyerCompany.name}`;
}

function lockedRequestLabel(request: LockedInboundRequest): string {
  return request.buyerName
    ? `${request.title} · ${request.buyerName}`
    : request.title;
}

function quoteLinkLabel(quote: Pick<SupplierQuoteSummary, 'id' | 'number'>): string {
  return quote.number?.trim() || quote.id.slice(0, 8);
}

export function CreateQuoteFromInboundDialog({
  open,
  onClose,
  companyId,
  lockedRequest,
}: CreateQuoteFromInboundDialogProps) {
  const { t } = useTranslation('quotes');
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [selected, setSelected] =
    useState<InboundMaterialRequestSummary | null>(null);
  const [number, setNumber] = useState('');
  const [currency, setCurrency] = useState('');
  const [submitOnCreate, setSubmitOnCreate] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [existingQuote, setExistingQuote] = useState<SupplierQuoteSummary | null>(
    null,
  );
  const [checkingExisting, setCheckingExisting] = useState(false);

  const isLocked = Boolean(lockedRequest);
  const inboundQuery = useListInboundRequestsQuery(
    { companyId, limit: 100, offset: 0 },
    { skip: !open || !companyId || isLocked },
  );
  const [listQuotes] = useLazyListQuotesQuery();
  const [createQuote, createState] = useCreateQuoteMutation();

  const requests = inboundQuery.data?.requests ?? [];
  const requestId = lockedRequest?.id ?? selected?.id;
  const trimmedNumber = number.trim();
  const currencyOptions = currencySelectOptions(currency);
  const canCreate = Boolean(
    requestId &&
      trimmedNumber &&
      currency &&
      !existingQuote &&
      !checkingExisting,
  );

  useEffect(() => {
    if (!open || !requestId) {
      setExistingQuote(null);
      setCheckingExisting(false);
      return;
    }

    let cancelled = false;
    setCheckingExisting(true);
    setExistingQuote(null);

    void listQuotes({
      companyId,
      requestId,
      direction: 'outbound',
      limit: 1,
      offset: 0,
    })
      .unwrap()
      .then((result) => {
        if (!cancelled) {
          setExistingQuote(result.quotes[0] ?? null);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setExistingQuote(null);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setCheckingExisting(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [open, requestId, companyId, listQuotes]);

  function resetAndClose() {
    setSelected(null);
    setNumber('');
    setCurrency('');
    setSubmitOnCreate(false);
    setExistingQuote(null);
    setCheckingExisting(false);
    createState.reset();
    onClose();
  }

  function handleClose() {
    if (isSubmitting || createState.isLoading) {
      return;
    }
    resetAndClose();
  }

  async function handleCreate() {
    if (!requestId || !trimmedNumber || !currency || existingQuote) {
      return;
    }

    setIsSubmitting(true);
    try {
      const existing = await listQuotes({
        companyId,
        requestId,
        direction: 'outbound',
        limit: 1,
        offset: 0,
      }).unwrap();

      const found = existing.quotes[0];
      if (found) {
        setExistingQuote(found);
        return;
      }

      const result = await createQuote({
        companyId,
        requestId,
        number: trimmedNumber,
        currency,
        submitOnCreate,
      }).unwrap();

      enqueueSnackbar(t('toast.created'), { variant: 'success' });
      resetAndClose();
      navigate(`/app/quotes/${result.quote.id}`);
    } finally {
      setIsSubmitting(false);
    }
  }

  const busy = isSubmitting || createState.isLoading;
  const showRequestPicker = !isLocked;
  const showEmptyInbound =
    showRequestPicker && !inboundQuery.isLoading && requests.length === 0;
  const showCreateFields = !existingQuote && !checkingExisting;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>{t('createFromInbound.title')}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1 }}>
          <ApiErrorAlert error={createState.error ?? inboundQuery.error} />
          <Typography variant="body2" color="text.secondary">
            {isLocked
              ? t('createFromInbound.lockedMessage')
              : t('createFromInbound.message')}
          </Typography>

          {showRequestPicker && inboundQuery.isLoading ? (
            <Stack alignItems="center" py={2}>
              <CircularProgress size={28} />
            </Stack>
          ) : showEmptyInbound ? (
            <Stack spacing={1}>
              <Typography color="text.secondary">
                {t('createFromInbound.empty')}
              </Typography>
              <Link
                component={RouterLink}
                to="/app/requests?tab=inbound"
                underline="hover"
              >
                {t('createFromInbound.goToInboundRequests')}
              </Link>
            </Stack>
          ) : (
            <>
              {isLocked && lockedRequest ? (
                <TextField
                  label={t('createFromInbound.request')}
                  value={lockedRequestLabel(lockedRequest)}
                  fullWidth
                  disabled
                />
              ) : (
                <Autocomplete
                  options={requests}
                  value={selected}
                  onChange={(_event, value) => setSelected(value)}
                  getOptionLabel={requestOptionLabel}
                  isOptionEqualToValue={(option, value) => option.id === value.id}
                  disabled={busy}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label={t('createFromInbound.request')}
                      placeholder={t('createFromInbound.requestPlaceholder')}
                    />
                  )}
                />
              )}

              {checkingExisting ? (
                <Stack alignItems="center" py={1}>
                  <CircularProgress size={24} />
                </Stack>
              ) : null}

              {existingQuote ? (
                <Alert severity="info">
                  {t('createFromInbound.existingQuote')}{' '}
                  <Link
                    component={RouterLink}
                    to={`/app/quotes/${existingQuote.id}`}
                    underline="hover"
                  >
                    {t('createFromInbound.openExistingQuote', {
                      number: quoteLinkLabel(existingQuote),
                    })}
                  </Link>
                </Alert>
              ) : null}

              {showCreateFields ? (
                <>
                  <TextField
                    label={t('form.number')}
                    value={number}
                    onChange={(event) => setNumber(event.target.value)}
                    required
                    fullWidth
                    disabled={busy}
                  />

                  <FormControl fullWidth required disabled={busy}>
                    <InputLabel id="create-quote-currency">
                      {t('form.currency')}
                    </InputLabel>
                    <Select
                      labelId="create-quote-currency"
                      label={t('form.currency')}
                      value={currency}
                      onChange={(event) => setCurrency(event.target.value)}
                    >
                      {currencyOptions.map((code) => (
                        <MenuItem key={code} value={code}>
                          {code}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={submitOnCreate}
                        onChange={(event) =>
                          setSubmitOnCreate(event.target.checked)
                        }
                        disabled={busy}
                      />
                    }
                    label={t('createFromInbound.submitOnCreate')}
                  />
                </>
              ) : null}
            </>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={busy}>
          {t('actions.cancel')}
        </Button>
        <Button
          variant="contained"
          onClick={() => void handleCreate()}
          disabled={busy || !canCreate}
        >
          {t('actions.create')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
