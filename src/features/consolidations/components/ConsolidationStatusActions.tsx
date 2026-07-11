import { useState } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';

import type { ConsolidationStatus } from '@/api/generated/models/consolidationStatus';
import {
  useMarkConsolidationCustomsMutation,
  useMarkConsolidationDeliveredMutation,
  useMarkConsolidationInTransitMutation,
  usePlanConsolidationMutation,
} from '@/api/endpoints/consolidationsApi';
import { ApiErrorAlert } from '@/components/ApiErrorAlert';
import { PermissionGate } from '@/components/PermissionGate';

interface ConsolidationStatusActionsProps {
  companyId: string;
  consolidationId: string;
  status: ConsolidationStatus;
}

export function ConsolidationStatusActions({
  companyId,
  consolidationId,
  status,
}: ConsolidationStatusActionsProps) {
  const { t } = useTranslation('consolidations');
  const { enqueueSnackbar } = useSnackbar();
  const [planOpen, setPlanOpen] = useState(false);
  const [transitOpen, setTransitOpen] = useState(false);
  const [customsOpen, setCustomsOpen] = useState(false);
  const [deliveredOpen, setDeliveredOpen] = useState(false);

  const [planConsolidation, planState] = usePlanConsolidationMutation();
  const [markInTransit, transitState] = useMarkConsolidationInTransitMutation();
  const [markCustoms, customsState] = useMarkConsolidationCustomsMutation();
  const [markDelivered, deliveredState] = useMarkConsolidationDeliveredMutation();

  if (
    status !== 'DRAFT' &&
    status !== 'PLANNED' &&
    status !== 'IN_TRANSIT' &&
    status !== 'CUSTOMS'
  ) {
    return null;
  }

  async function handlePlan() {
    await planConsolidation({ companyId, consolidationId }).unwrap();
    enqueueSnackbar(t('toast.planned'), { variant: 'success' });
    setPlanOpen(false);
  }

  async function handleMarkInTransit() {
    await markInTransit({ companyId, consolidationId }).unwrap();
    enqueueSnackbar(t('toast.inTransit'), { variant: 'success' });
    setTransitOpen(false);
  }

  async function handleMarkCustoms() {
    await markCustoms({ companyId, consolidationId }).unwrap();
    enqueueSnackbar(t('toast.customs'), { variant: 'success' });
    setCustomsOpen(false);
  }

  async function handleMarkDelivered() {
    await markDelivered({ companyId, consolidationId }).unwrap();
    enqueueSnackbar(t('toast.delivered'), { variant: 'success' });
    setDeliveredOpen(false);
  }

  return (
    <PermissionGate permission="manageConsolidations">
      {status === 'DRAFT' ? (
        <>
          <Button variant="contained" onClick={() => setPlanOpen(true)}>
            {t('actions.plan')}
          </Button>
          <Dialog open={planOpen} onClose={() => setPlanOpen(false)}>
            <DialogTitle>{t('confirm.planTitle')}</DialogTitle>
            <DialogContent>
              <ApiErrorAlert error={planState.error} />
              <Typography>{t('confirm.planMessage')}</Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setPlanOpen(false)}>
                {t('actions.dismiss')}
              </Button>
              <Button
                variant="contained"
                onClick={handlePlan}
                disabled={planState.isLoading}
              >
                {t('actions.plan')}
              </Button>
            </DialogActions>
          </Dialog>
        </>
      ) : null}
      {status === 'PLANNED' ? (
        <>
          <Button variant="contained" onClick={() => setTransitOpen(true)}>
            {t('actions.markInTransit')}
          </Button>
          <Dialog open={transitOpen} onClose={() => setTransitOpen(false)}>
            <DialogTitle>{t('confirm.inTransitTitle')}</DialogTitle>
            <DialogContent>
              <ApiErrorAlert error={transitState.error} />
              <Typography>{t('confirm.inTransitMessage')}</Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setTransitOpen(false)}>
                {t('actions.dismiss')}
              </Button>
              <Button
                variant="contained"
                onClick={handleMarkInTransit}
                disabled={transitState.isLoading}
              >
                {t('actions.markInTransit')}
              </Button>
            </DialogActions>
          </Dialog>
        </>
      ) : null}
      {status === 'IN_TRANSIT' ? (
        <>
          <Button variant="contained" onClick={() => setCustomsOpen(true)}>
            {t('actions.markCustoms')}
          </Button>
          <Dialog open={customsOpen} onClose={() => setCustomsOpen(false)}>
            <DialogTitle>{t('confirm.customsTitle')}</DialogTitle>
            <DialogContent>
              <ApiErrorAlert error={customsState.error} />
              <Typography>{t('confirm.customsMessage')}</Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setCustomsOpen(false)}>
                {t('actions.dismiss')}
              </Button>
              <Button
                variant="contained"
                onClick={handleMarkCustoms}
                disabled={customsState.isLoading}
              >
                {t('actions.markCustoms')}
              </Button>
            </DialogActions>
          </Dialog>
        </>
      ) : null}
      {status === 'CUSTOMS' ? (
        <>
          <Button variant="contained" onClick={() => setDeliveredOpen(true)}>
            {t('actions.markDelivered')}
          </Button>
          <Dialog open={deliveredOpen} onClose={() => setDeliveredOpen(false)}>
            <DialogTitle>{t('confirm.deliveredTitle')}</DialogTitle>
            <DialogContent>
              <ApiErrorAlert error={deliveredState.error} />
              <Typography>{t('confirm.deliveredMessage')}</Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDeliveredOpen(false)}>
                {t('actions.dismiss')}
              </Button>
              <Button
                variant="contained"
                onClick={handleMarkDelivered}
                disabled={deliveredState.isLoading}
              >
                {t('actions.markDelivered')}
              </Button>
            </DialogActions>
          </Dialog>
        </>
      ) : null}
    </PermissionGate>
  );
}
