import { useState } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  ListItemIcon,
  ListItemText,
  Typography,
} from '@mui/material';
import EventAvailableOutlinedIcon from '@mui/icons-material/EventAvailableOutlined';
import GavelOutlinedIcon from '@mui/icons-material/GavelOutlined';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import WhereToVoteOutlinedIcon from '@mui/icons-material/WhereToVoteOutlined';
import { useTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';

import type { ConsolidationStatus } from '@/api/generated/models/consolidationStatus';
import {
  useMarkConsolidationCustomsMutation,
  useMarkConsolidationDeliveredMutation,
  useMarkConsolidationInTransitMutation,
  usePlanConsolidationMutation,
} from '@/api/endpoints/consolidationsApi';
import { ApiErrorAlert } from '@/components/feedback/apiErrorAlert/ApiErrorAlert';
import { DocumentActionMenuItem } from '@/layouts/documentDetailLayout/DocumentDetailActionsMenu';
import { PermissionGate } from '@/components/auth/permissionGate/PermissionGate';

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
  const [markDelivered, deliveredState] =
    useMarkConsolidationDeliveredMutation();

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
          <DocumentActionMenuItem onClick={() => setPlanOpen(true)}>
            <ListItemIcon>
              <EventAvailableOutlinedIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>{t('actions.plan')}</ListItemText>
          </DocumentActionMenuItem>
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
          <DocumentActionMenuItem onClick={() => setTransitOpen(true)}>
            <ListItemIcon>
              <LocalShippingOutlinedIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>{t('actions.markInTransit')}</ListItemText>
          </DocumentActionMenuItem>
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
          <DocumentActionMenuItem onClick={() => setCustomsOpen(true)}>
            <ListItemIcon>
              <GavelOutlinedIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>{t('actions.markCustoms')}</ListItemText>
          </DocumentActionMenuItem>
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
          <DocumentActionMenuItem onClick={() => setDeliveredOpen(true)}>
            <ListItemIcon>
              <WhereToVoteOutlinedIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>{t('actions.markDelivered')}</ListItemText>
          </DocumentActionMenuItem>
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
