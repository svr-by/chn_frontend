import { useState } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';

import {
  useDeactivateCompanyMutation,
  useReactivateCompanyMutation,
} from '@/api/endpoints/companiesApi';
import { useGetMeQuery } from '@/api/endpoints/authApi';
import { ApiErrorAlert } from '@/components/feedback/apiErrorAlert/ApiErrorAlert';
import { useAppSelector } from '@/hooks/useAppSelector';
import { authStorage } from '@/lib/authStorage';
import { getActiveMembership, isCompanyOperational } from '@/lib/permissions';

export function CompanyStatusPanel() {
  const { t } = useTranslation('profile');
  const { enqueueSnackbar } = useSnackbar();
  const companyId = useAppSelector((state) => state.auth.activeCompanyId);
  const hasRefreshToken = Boolean(authStorage.getRefreshToken());
  const { data } = useGetMeQuery(undefined, { skip: !hasRefreshToken });
  const membership = getActiveMembership(data?.user, companyId);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const [deactivateCompany, deactivateState] = useDeactivateCompanyMutation();
  const [reactivateCompany, reactivateState] = useReactivateCompanyMutation();

  if (!companyId || membership?.role !== 'OWNER') {
    return null;
  }

  const activeCompanyId = companyId;
  const isActive = isCompanyOperational(membership.company);
  const mutationError = deactivateState.error ?? reactivateState.error;
  const isLoading = deactivateState.isLoading || reactivateState.isLoading;

  async function handleDeactivate() {
    try {
      await deactivateCompany(activeCompanyId).unwrap();
      enqueueSnackbar(t('companyStatus.toast.deactivated'), {
        variant: 'success',
      });
      setConfirmOpen(false);
    } catch {
      // ApiErrorAlert
    }
  }

  async function handleReactivate() {
    try {
      await reactivateCompany(activeCompanyId).unwrap();
      enqueueSnackbar(t('companyStatus.toast.reactivated'), {
        variant: 'success',
      });
    } catch {
      // ApiErrorAlert
    }
  }

  return (
    <>
      <Paper variant="outlined" sx={{ p: { xs: 2, sm: 2.5 } }}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'stretch', sm: 'center' }}
          spacing={2}
        >
          <Stack spacing={0.5} sx={{ minWidth: 0, flex: 1 }}>
            <Typography variant="subtitle1" component="h2">
              {t('companyStatus.title')}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {isActive
                ? t('companyStatus.activeHint')
                : t('companyStatus.inactiveHint')}
            </Typography>
          </Stack>
          {isActive ? (
            <Button
              color="warning"
              variant="outlined"
              disabled={isLoading}
              onClick={() => setConfirmOpen(true)}
              sx={{
                flexShrink: 0,
                alignSelf: { xs: 'stretch', sm: 'center' },
              }}
            >
              {t('companyStatus.deactivate')}
            </Button>
          ) : (
            <Button
              color="primary"
              variant="contained"
              disabled={isLoading}
              onClick={() => void handleReactivate()}
              sx={{
                flexShrink: 0,
                alignSelf: { xs: 'stretch', sm: 'center' },
              }}
            >
              {t('companyStatus.reactivate')}
            </Button>
          )}
        </Stack>
        <ApiErrorAlert error={mutationError} />
      </Paper>

      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>{t('companyStatus.confirmDeactivateTitle')}</DialogTitle>
        <DialogContent>
          <Typography>{t('companyStatus.confirmDeactivateMessage')}</Typography>
          <ApiErrorAlert error={deactivateState.error} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>
            {t('companyStatus.cancel')}
          </Button>
          <Button
            color="warning"
            variant="contained"
            disabled={deactivateState.isLoading}
            onClick={() => void handleDeactivate()}
          >
            {t('companyStatus.deactivate')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
