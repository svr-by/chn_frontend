import { useEffect, useMemo, useState } from 'react';
import {
  Autocomplete,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormHelperText,
  Link,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';

import type { TradingPartner } from '@/api/generated/models/tradingPartner';
import { useListPartnersQuery } from '@/api/endpoints/partnersApi';
import { useDistributeRequestMutation } from '@/api/endpoints/requestsApi';
import { ApiErrorAlert } from '@/components/feedback/apiErrorAlert/ApiErrorAlert';

interface RequestDistributeToSupplierDialogProps {
  open: boolean;
  companyId: string;
  requestId: string;
  requestLineIds: string[];
  excludeSupplierCompanyIds?: string[];
  onClose: () => void;
  onDistributed?: () => void;
}

export function RequestDistributeToSupplierDialog({
  open,
  companyId,
  requestId,
  requestLineIds,
  excludeSupplierCompanyIds = [],
  onClose,
  onDistributed,
}: RequestDistributeToSupplierDialogProps) {
  const { t } = useTranslation('requests');
  const { enqueueSnackbar } = useSnackbar();
  const [supplier, setSupplier] = useState<TradingPartner | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const partnersQuery = useListPartnersQuery(
    { companyId },
    { skip: !open || !companyId },
  );

  const [distributeRequest, distributeState] = useDistributeRequestMutation();

  const excludedIds = useMemo(
    () => new Set(excludeSupplierCompanyIds),
    [excludeSupplierCompanyIds],
  );

  const availablePartners = useMemo(
    () =>
      (partnersQuery.data?.partners ?? []).filter(
        (partner) =>
          partner.status === 'ACTIVE' && !excludedIds.has(partner.company.id),
      ),
    [partnersQuery.data?.partners, excludedIds],
  );

  const hasActivePartners = useMemo(
    () =>
      (partnersQuery.data?.partners ?? []).some(
        (partner) => partner.status === 'ACTIVE',
      ),
    [partnersQuery.data?.partners],
  );

  useEffect(() => {
    if (!open) {
      return;
    }

    setSupplier(null);
    setValidationError(null);
  }, [open]);

  async function handleDistribute() {
    if (!supplier) {
      setValidationError(t('distribute.validation.supplierRequired'));
      return;
    }

    if (requestLineIds.length === 0) {
      setValidationError(t('distribute.validation.linesSelectedRequired'));
      return;
    }

    try {
      await distributeRequest({
        companyId,
        requestId,
        createProducts: false,
        distributions: [
          {
            supplierCompanyId: supplier.company.id,
            requestLineIds,
          },
        ],
      }).unwrap();

      enqueueSnackbar(t('distribute.toast.success'), { variant: 'success' });
      setSupplier(null);
      setValidationError(null);
      onDistributed?.();
      onClose();
    } catch {
      // ApiErrorAlert shows distributeState.error
    }
  }

  function handleClose() {
    setSupplier(null);
    setValidationError(null);
    onClose();
  }

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>{t('distribute.title')}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1 }}>
          <ApiErrorAlert error={distributeState.error} />

          <Typography>
            {t('distribute.allLines', { count: requestLineIds.length })}
          </Typography>

          {partnersQuery.isLoading ? (
            <Typography color="text.secondary">
              {t('distribute.loading')}
            </Typography>
          ) : !hasActivePartners ? (
            <Stack spacing={1}>
              <Typography color="text.secondary">
                {t('distribute.empty')}
              </Typography>
              <Link component={RouterLink} to="/app/partners" underline="hover">
                {t('distribute.goToPartners')}
              </Link>
            </Stack>
          ) : availablePartners.length === 0 ? (
            <Typography color="text.secondary">
              {t('distribute.allAssigned')}
            </Typography>
          ) : (
            <Autocomplete
              options={availablePartners}
              value={supplier}
              onChange={(_event, value) => {
                setValidationError(null);
                setSupplier(value);
              }}
              getOptionLabel={(option) => option.company.name}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label={t('distribute.supplier')}
                  placeholder={t('distribute.supplierPlaceholder')}
                />
              )}
            />
          )}

          {validationError ? (
            <FormHelperText error>{validationError}</FormHelperText>
          ) : null}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>{t('actions.cancel')}</Button>
        <Button
          variant="contained"
          onClick={() => void handleDistribute()}
          disabled={
            distributeState.isLoading ||
            !supplier ||
            requestLineIds.length === 0 ||
            availablePartners.length === 0
          }
        >
          {t('actions.distribute')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
