import {
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  FormGroup,
  FormHelperText,
  Link,
  Stack,
  Typography,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { useMemo, useState } from 'react';

import { useTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';
import { z } from 'zod';
import { useListPartnersQuery } from '@/api/endpoints/partnersApi';
import { useDistributeRequestMutation } from '@/api/endpoints/requestsApi';
import { ApiErrorAlert } from '@/components/ApiErrorAlert';

interface RequestDistributeDialogProps {
  open: boolean;
  companyId: string;
  requestId: string;
  onClose: () => void;
  onDistributed?: () => void;
}

export function RequestDistributeDialog({
  open,
  companyId,
  requestId,
  onClose,
  onDistributed,
}: RequestDistributeDialogProps) {
  const { t } = useTranslation(['requests', 'validation']);
  const { enqueueSnackbar } = useSnackbar();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [validationError, setValidationError] = useState<string | null>(null);

  const partnersQuery = useListPartnersQuery(
    { companyId },
    { skip: !open || !companyId },
  );

  const [distributeRequest, distributeState] = useDistributeRequestMutation();

  const distributeSchema = useMemo(
    () =>
      z.object({
        supplierCompanyIds: z
          .array(
            z.string().uuid({ message: t('validation:invalidUuid') }),
          )
          .min(1, { message: t('validation:minItems', { min: 1 }) }),
      }),
    [t],
  );

  const activePartners = useMemo(
    () =>
      (partnersQuery.data?.partners ?? []).filter(
        (partner) => partner.status === 'ACTIVE',
      ),
    [partnersQuery.data?.partners],
  );

  function togglePartner(companyIdToToggle: string) {
    setValidationError(null);
    setSelectedIds((current) =>
      current.includes(companyIdToToggle)
        ? current.filter((id) => id !== companyIdToToggle)
        : [...current, companyIdToToggle],
    );
  }

  async function handleDistribute() {
    const parsed = distributeSchema.safeParse({
      supplierCompanyIds: selectedIds,
    });
    if (!parsed.success) {
      setValidationError(
        parsed.error.issues[0]?.message ?? t('validation:minItems', { min: 1 }),
      );
      return;
    }

    await distributeRequest({
      companyId,
      requestId,
      supplierCompanyIds: parsed.data.supplierCompanyIds,
    }).unwrap();

    enqueueSnackbar(t('distribute.toast.success'), { variant: 'success' });
    setSelectedIds([]);
    setValidationError(null);
    onDistributed?.();
    onClose();
  }

  function handleClose() {
    setSelectedIds([]);
    setValidationError(null);
    onClose();
  }

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>{t('distribute.title')}</DialogTitle>
      <DialogContent>
        <ApiErrorAlert error={distributeState.error} />
        <Typography sx={{ mb: 2 }}>{t('distribute.message')}</Typography>

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
          <FormGroup>
            {activePartners.map((partner) => (
              <FormControlLabel
                key={partner.id}
                control={
                  <Checkbox
                    checked={selectedIds.includes(partner.company.id)}
                    onChange={() => togglePartner(partner.company.id)}
                  />
                }
                label={partner.company.name}
              />
            ))}
          </FormGroup>
        )}
        {validationError ? (
          <FormHelperText error sx={{ mt: 1 }}>
            {validationError}
          </FormHelperText>
        ) : null}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>{t('actions.cancel')}</Button>
        <Button
          variant="contained"
          onClick={() => void handleDistribute()}
          disabled={
            distributeState.isLoading ||
            selectedIds.length === 0 ||
            activePartners.length === 0
          }
        >
          {t('actions.distribute')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
