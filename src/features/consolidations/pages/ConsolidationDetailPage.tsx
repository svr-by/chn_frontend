import { useEffect } from 'react';
import { Stack, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';
import { useNavigate, useParams } from 'react-router-dom';

import {
  useGetConsolidatableShippingInvoicesQuery,
  useGetConsolidationQuery,
} from '@/api/endpoints/consolidationsApi';
import { ConsolidationStatusBadge } from '@/components/ConsolidationStatusBadge';
import { DocumentDetailLayout } from '@/layouts/DocumentDetailLayout';
import { ConsolidationHeaderForm } from '@/features/consolidations/components/ConsolidationHeaderForm';
import { ConsolidationShippingInvoicesTable } from '@/features/consolidations/components/ConsolidationShippingInvoicesTable';
import { ConsolidationStatusActions } from '@/features/consolidations/components/ConsolidationStatusActions';
import { useAppSelector } from '@/hooks/useAppSelector';
import { usePermissions } from '@/hooks/usePermissions';

export function ConsolidationDetailPage() {
  const { t } = useTranslation('consolidations');
  const { t: tEnums } = useTranslation('enums');
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { consolidationId } = useParams<{ consolidationId: string }>();
  const companyId = useAppSelector((state) => state.auth.activeCompanyId);
  const { hasPermission } = usePermissions();

  const consolidationQuery = useGetConsolidationQuery(
    { companyId: companyId ?? '', consolidationId: consolidationId ?? '' },
    { skip: !companyId || !consolidationId },
  );

  const consolidation = consolidationQuery.data?.consolidation;
  const isDraft = consolidation?.status === 'DRAFT';
  const canEdit = isDraft && hasPermission('manageConsolidations');

  const consolidatableQuery = useGetConsolidatableShippingInvoicesQuery(
    { companyId: companyId ?? '' },
    { skip: !companyId || !canEdit },
  );

  useEffect(() => {
    if (
      consolidationQuery.isError &&
      'status' in consolidationQuery.error &&
      consolidationQuery.error.status === 404
    ) {
      enqueueSnackbar(t('toast.notFound'), { variant: 'error' });
      navigate('/app/consolidations', { replace: true });
    }
  }, [
    consolidationQuery.isError,
    consolidationQuery.error,
    enqueueSnackbar,
    navigate,
    t,
  ]);

  if (!companyId || !consolidationId) {
    return null;
  }

  const title = t('detail.fallbackTitle', {
    id: consolidationId.slice(0, 8),
  });

  return (
    <DocumentDetailLayout
      title={title}
      statusBadge={
        consolidation?.status ? (
          <ConsolidationStatusBadge status={consolidation.status} />
        ) : undefined
      }
      backTo="/app/consolidations"
      backLabel={t('actions.backToList')}
      loading={consolidationQuery.isLoading}
      error={consolidationQuery.error}
      actions={
        consolidation ? (
          <ConsolidationStatusActions
            companyId={companyId}
            consolidationId={consolidation.id}
            status={consolidation.status}
          />
        ) : null
      }
      meta={
        consolidation ? (
          <Stack spacing={0.5}>
            <Typography variant="body2" color="text.secondary">
              {t('detail.buyer', {
                name: consolidation.buyerCompany?.name ?? '—',
              })}
            </Typography>
            {consolidation.transportMode ? (
              <Typography variant="body2" color="text.secondary">
                {t('detail.transportMode', {
                  value: tEnums(
                    `transportMode.${consolidation.transportMode.toLowerCase()}`,
                  ),
                })}
              </Typography>
            ) : null}
            {consolidation.carrier ? (
              <Typography variant="body2" color="text.secondary">
                {t('detail.carrier', { value: consolidation.carrier })}
              </Typography>
            ) : null}
            {consolidation.trackingNumber ? (
              <Typography variant="body2" color="text.secondary">
                {t('detail.trackingNumber', {
                  value: consolidation.trackingNumber,
                })}
              </Typography>
            ) : null}
            {consolidation.origin ? (
              <Typography variant="body2" color="text.secondary">
                {t('detail.origin', { value: consolidation.origin })}
              </Typography>
            ) : null}
            {consolidation.destination ? (
              <Typography variant="body2" color="text.secondary">
                {t('detail.destination', {
                  value: consolidation.destination,
                })}
              </Typography>
            ) : null}
            {consolidation.plannedAt ? (
              <Typography variant="body2" color="text.secondary">
                {t('detail.plannedAt', {
                  date: new Date(consolidation.plannedAt).toLocaleString(),
                })}
              </Typography>
            ) : null}
            {consolidation.inTransitAt ? (
              <Typography variant="body2" color="text.secondary">
                {t('detail.inTransitAt', {
                  date: new Date(consolidation.inTransitAt).toLocaleString(),
                })}
              </Typography>
            ) : null}
            {consolidation.customsAt ? (
              <Typography variant="body2" color="text.secondary">
                {t('detail.customsAt', {
                  date: new Date(consolidation.customsAt).toLocaleString(),
                })}
              </Typography>
            ) : null}
            {consolidation.deliveredAt ? (
              <Typography variant="body2" color="text.secondary">
                {t('detail.deliveredAt', {
                  date: new Date(consolidation.deliveredAt).toLocaleString(),
                })}
              </Typography>
            ) : null}
          </Stack>
        ) : null
      }
    >
      {consolidation ? (
        <Stack spacing={3}>
          <ConsolidationHeaderForm
            companyId={companyId}
            consolidation={consolidation}
            editable={canEdit}
          />
          <ConsolidationShippingInvoicesTable
            companyId={companyId}
            consolidationId={consolidation.id}
            entries={consolidation.shippingInvoices}
            consolidatableInvoices={
              consolidatableQuery.data?.shippingInvoices ?? []
            }
            editable={canEdit}
          />
        </Stack>
      ) : null}
    </DocumentDetailLayout>
  );
}
