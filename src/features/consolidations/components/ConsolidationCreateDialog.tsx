import { useState } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';
import { useNavigate } from 'react-router-dom';

import type { ConsolidationTransportMode } from '@/api/generated/models/consolidationTransportMode';
import {
  useCreateConsolidationMutation,
  useGetConsolidatableShippingInvoicesQuery,
} from '@/api/endpoints/consolidationsApi';
import { ApiErrorAlert } from '@/components/ApiErrorAlert';
import { useAppSelector } from '@/hooks/useAppSelector';

type TransportModeValue = NonNullable<ConsolidationTransportMode>;

const TRANSPORT_MODES: TransportModeValue[] = ['ROAD', 'AIR', 'RAIL', 'SEA'];

interface ConsolidationCreateDialogProps {
  open: boolean;
  onClose: () => void;
  initialShippingInvoiceId?: string | null;
}

export function ConsolidationCreateDialog({
  open,
  onClose,
  initialShippingInvoiceId,
}: ConsolidationCreateDialogProps) {
  const { t } = useTranslation('consolidations');
  const { t: tEnums } = useTranslation('enums');
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const companyId = useAppSelector((state) => state.auth.activeCompanyId);

  const [transportMode, setTransportMode] = useState<TransportModeValue | ''>(
    '',
  );
  const [carrier, setCarrier] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>(
    initialShippingInvoiceId ? [initialShippingInvoiceId] : [],
  );

  const consolidatableQuery = useGetConsolidatableShippingInvoicesQuery(
    { companyId: companyId ?? '' },
    { skip: !companyId || !open },
  );

  const [createConsolidation, createState] = useCreateConsolidationMutation();

  const availableInvoices = consolidatableQuery.data?.shippingInvoices ?? [];

  async function handleCreate() {
    if (!companyId || selectedIds.length === 0) {
      return;
    }

    if (availableInvoices.length === 0) {
      enqueueSnackbar(t('toast.noConsolidatable'), { variant: 'warning' });
      return;
    }

    const created = await createConsolidation({
      companyId,
      ...(transportMode ? { transportMode } : {}),
      ...(carrier.trim() ? { carrier: carrier.trim() } : {}),
      ...(trackingNumber.trim()
        ? { trackingNumber: trackingNumber.trim() }
        : {}),
      ...(origin.trim() ? { origin: origin.trim() } : {}),
      ...(destination.trim() ? { destination: destination.trim() } : {}),
      shippingInvoiceIds: selectedIds,
    }).unwrap();

    navigate(`/app/consolidations/${created.consolidation.id}`);
    onClose();
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{t('create.title')}</DialogTitle>
      <DialogContent>
        <ApiErrorAlert error={createState.error} />
        <Stack spacing={2} sx={{ pt: 1 }}>
          <FormControl fullWidth>
            <InputLabel id="consolidation-transport-mode">
              {t('form.transportMode')}
            </InputLabel>
            <Select
              labelId="consolidation-transport-mode"
              label={t('form.transportMode')}
              value={transportMode}
              onChange={(event) =>
                setTransportMode(event.target.value as TransportModeValue | '')
              }
            >
              <MenuItem value="">
                <em>{t('form.transportModeNone')}</em>
              </MenuItem>
              {TRANSPORT_MODES.map((mode) => (
                <MenuItem key={mode} value={mode}>
                  {tEnums(`transportMode.${mode.toLowerCase()}`)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            label={t('form.carrier')}
            value={carrier}
            onChange={(event) => setCarrier(event.target.value)}
            fullWidth
          />
          <TextField
            label={t('form.trackingNumber')}
            value={trackingNumber}
            onChange={(event) => setTrackingNumber(event.target.value)}
            fullWidth
          />
          <TextField
            label={t('form.origin')}
            value={origin}
            onChange={(event) => setOrigin(event.target.value)}
            fullWidth
          />
          <TextField
            label={t('form.destination')}
            value={destination}
            onChange={(event) => setDestination(event.target.value)}
            fullWidth
          />
          <FormControl fullWidth>
            <InputLabel id="consolidation-shipping-invoices">
              {t('create.shippingInvoices')}
            </InputLabel>
            <Select
              labelId="consolidation-shipping-invoices"
              label={t('create.shippingInvoices')}
              multiple
              value={selectedIds}
              onChange={(event) => {
                const value = event.target.value;
                setSelectedIds(
                  typeof value === 'string' ? value.split(',') : value,
                );
              }}
              renderValue={(selected) =>
                selected
                  .map((id) => {
                    const invoice = availableInvoices.find(
                      (item) => item.id === id,
                    );
                    return (
                      invoice?.trackingNumber ??
                      t('create.shippingInvoiceFallback', {
                        id: id.slice(0, 8),
                      })
                    );
                  })
                  .join(', ')
              }
            >
              {availableInvoices.map((invoice) => (
                <MenuItem key={invoice.id} value={invoice.id}>
                  {t('create.shippingInvoiceOption', {
                    id: invoice.id.slice(0, 8),
                    supplier: invoice.supplierCompany?.name ?? '—',
                    tracking: invoice.trackingNumber ?? '—',
                  })}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t('actions.dismiss')}</Button>
        <Button
          variant="contained"
          onClick={handleCreate}
          disabled={
            createState.isLoading ||
            selectedIds.length === 0 ||
            availableInvoices.length === 0
          }
        >
          {t('actions.create')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
