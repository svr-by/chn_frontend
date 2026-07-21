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
import { ApiErrorAlert } from '@/components/ApiErrorAlert';

interface RequestDistributeToSupplierDialogProps {
  open: boolean;
  companyId: string;
  requestId: string;
  requestLineIds: string[];
  initialSupplierCompanyId?: string;
  onClose: () => void;
  onDistributed?: () => void;
}

export function RequestDistributeToSupplierDialog({
  open,
  companyId,
  requestId,
  requestLineIds,
  initialSupplierCompanyId,
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

  const activePartners = useMemo(
    () =>
      (partnersQuery.data?.partners ?? []).filter(
        (partner) => partner.status === 'ACTIVE',
      ),
    [partnersQuery.data?.partners],
  );

  useEffect(() => {
    if (!open) {
      return;
    }

    const preselected =
      initialSupplierCompanyId == null
        ? null
        : (activePartners.find(
            (partner) => partner.company.id === initialSupplierCompanyId,
          ) ?? null);

    setSupplier(preselected);
    setValidationError(null);
  }, [open, initialSupplierCompanyId, activePartners]);

  async function handleDistribute() {
    if (!supplier) {
      setValidationError(t('distribute.validation.supplierRequired'));
      return;
    }

    if (requestLineIds.length === 0) {
      setValidationError(t('distribute.validation.linesSelectedRequired'));
      return;
    }

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
            {t('distribute.selectedLines', { count: requestLineIds.length })}
          </Typography>

          {partnersQuery.isLoading ? (
            <Typography color="text.secondary">{t('distribute.loading')}</Typography>
          ) : activePartners.length === 0 ? (
            <Stack spacing={1}>
              <Typography color="text.secondary">
                {t('distribute.empty')}
              </Typography>
              <Link component={RouterLink} to="/app/partners" underline="hover">
                {t('distribute.goToPartners')}
              </Link>
            </Stack>
          ) : (
            <Autocomplete
              options={activePartners}
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
            activePartners.length === 0
          }
        >
          {t('actions.distribute')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
