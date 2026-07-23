import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Stack, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';

import { useGetRequestQuery } from '@/api/endpoints/requestsApi';
import { DocumentDetailTabs } from '@/features/collaboration/components/documentDetailTabs/DocumentDetailTabs';
import { DocumentDetailLayout } from '@/layouts/DocumentDetailLayout';
import { StatusBadge } from '@/components/StatusBadge';
import { RequestLinesTable } from '@/features/requests/components/RequestLinesTable';
import { RequestQuotesMatrix } from '@/features/requests/components/requestQuotesMatrix/RequestQuotesMatrix';
import { RequestSuppliersMatrix } from '@/features/requests/components/requestSuppliersMatrix/RequestSuppliersMatrix';
import { RequestStatusActions } from '@/features/requests/components/RequestStatusActions';
import { useAppSelector } from '@/hooks/useAppSelector';
import { usePermissions } from '@/hooks/usePermissions';

export function RequestDetailPage() {
  const { t } = useTranslation('requests');
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { requestId } = useParams<{ requestId: string }>();
  const companyId = useAppSelector((state) => state.auth.activeCompanyId);
  const { hasPermission } = usePermissions();

  const requestQuery = useGetRequestQuery(
    { companyId: companyId ?? '', requestId: requestId ?? '' },
    { skip: !companyId || !requestId },
  );

  const request = requestQuery.data?.request;
  const canEdit = hasPermission('manageRequests');

  useEffect(() => {
    if (
      requestQuery.isError &&
      'status' in requestQuery.error &&
      requestQuery.error.status === 404
    ) {
      enqueueSnackbar(t('toast.notFound'), { variant: 'error' });
      navigate('/app/requests', { replace: true });
    }
  }, [requestQuery.isError, requestQuery.error, enqueueSnackbar, navigate, t]);

  if (!companyId || !requestId) {
    return null;
  }

  const title =
    request?.title ?? t('detail.fallbackTitle', { id: requestId.slice(0, 8) });

  return (
    <DocumentDetailLayout
      title={t('detail.title', { title })}
      statusBadge={
        request?.status ? <StatusBadge status={request.status} /> : undefined
      }
      loading={requestQuery.isLoading}
      error={requestQuery.error}
      actions={
        request ? (
          <RequestStatusActions
            companyId={companyId}
            requestId={request.id}
            status={request.status}
            requestLines={request.lines}
          />
        ) : null
      }
      meta={
        request ? (
          <Stack spacing={0.5}>
            {request.createdByUserName ? (
              <Typography variant="body2" color="text.secondary">
                {t('detail.createdBy', { name: request.createdByUserName })}
              </Typography>
            ) : null}
            <Typography variant="body2" color="text.secondary">
              {t('detail.createdAt', {
                date: new Date(request.createdAt).toLocaleString(),
              })}
            </Typography>
            {request.submittedAt ? (
              <Typography variant="body2" color="text.secondary">
                {t('detail.submittedAt', {
                  date: new Date(request.submittedAt).toLocaleString(),
                })}
              </Typography>
            ) : null}
          </Stack>
        ) : null
      }
    >
      {request ? (
        <DocumentDetailTabs
          companyId={companyId}
          documentType="MATERIAL_REQUEST"
          documentId={request.id}
          enableComments={false}
          extraTabs={[
            {
              value: 'details',
              label: t('tabs.details'),
              panel: (
                <RequestLinesTable
                  companyId={companyId}
                  requestId={request.id}
                  lines={request.lines}
                  editable={canEdit}
                />
              ),
            },
            {
              value: 'suppliers',
              label: t('tabs.suppliers'),
              panel: (
                <RequestSuppliersMatrix
                  companyId={companyId}
                  requestId={request.id}
                  requestLines={request.lines}
                  requestStatus={request.status}
                />
              ),
            },
            {
              value: 'quotes',
              label: t('tabs.quotes'),
              panel: (
                <RequestQuotesMatrix
                  companyId={companyId}
                  requestId={request.id}
                />
              ),
            },
          ]}
        />
      ) : null}
    </DocumentDetailLayout>
  );
}
