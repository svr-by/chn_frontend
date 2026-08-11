import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Stack, Typography } from '@mui/material';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import ScheduleOutlinedIcon from '@mui/icons-material/ScheduleOutlined';
import { useTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';

import { useGetRequestQuery } from '@/api/endpoints/requestsApi';
import { DocumentDetailTabs } from '@/features/collaboration/components/documentDetailTabs/DocumentDetailTabs';
import { DocumentDetailLayout } from '@/layouts/DocumentDetailLayout';
import { StatusBadge } from '@/components/StatusBadge';
import {
  RequestHeaderFields,
  RequestNotesField,
  RequestTitleEditButton,
} from '@/features/requests/components/requestHeaderForm/RequestHeaderForm';
import { RequestLinesTable } from '@/features/requests/components/requestLinesTable/RequestLinesTable';
import { RequestSuppliersMatrix } from '@/features/requests/components/requestSuppliersMatrix/RequestSuppliersMatrix';
import { RequestStatusActions } from '@/features/requests/components/requestStatusActions/RequestStatusActions';
import { QuoteComparisonMatrix } from '@/features/quotes/components/quoteComparisonMatrix/QuoteComparisonMatrix';
import { useAppSelector } from '@/hooks/useAppSelector';
import { usePermissions } from '@/hooks/usePermissions';

export function RequestDetailPage() {
  const { t } = useTranslation(['requests', 'enums']);
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
  const canEdit =
    hasPermission('manageRequests') && request?.status !== 'CLOSED';

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
      maxWidth="fluid"
      title={t('detail.title', { title })}
      titleAction={
        request && canEdit ? (
          <RequestTitleEditButton companyId={companyId} request={request} />
        ) : null
      }
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
          <Stack spacing={0.75}>
            {request.createdByUserName ? (
              <Stack direction="row" spacing={1} alignItems="center">
                <PersonOutlineOutlinedIcon fontSize="small" color="action" />
                <Typography variant="body2" color="text.secondary">
                  {t('detail.createdBy', { name: request.createdByUserName })}
                </Typography>
              </Stack>
            ) : null}
            <Stack direction="row" spacing={1} alignItems="center">
              <ScheduleOutlinedIcon fontSize="small" color="action" />
              <Typography variant="body2" color="text.secondary">
                {t('detail.createdAt', {
                  date: new Date(request.createdAt).toLocaleString(),
                })}
              </Typography>
            </Stack>
            {request.submittedAt ? (
              <Stack direction="row" spacing={1} alignItems="center">
                <ScheduleOutlinedIcon fontSize="small" color="action" />
                <Typography variant="body2" color="text.secondary">
                  {t('detail.submittedAt', {
                    date: new Date(request.submittedAt).toLocaleString(),
                  })}
                </Typography>
              </Stack>
            ) : null}
          </Stack>
        ) : null
      }
    >
      {request ? (
        <Stack spacing={3}>
          <RequestHeaderFields
            companyId={companyId}
            request={request}
            editable={canEdit}
          />
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
                  <Stack spacing={3}>
                    <RequestLinesTable
                      companyId={companyId}
                      requestId={request.id}
                      lines={request.lines}
                      editable={canEdit}
                    />
                    <RequestNotesField
                      companyId={companyId}
                      request={request}
                      editable={canEdit}
                    />
                  </Stack>
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
                  <QuoteComparisonMatrix
                    companyId={companyId}
                    requestId={request.id}
                  />
                ),
              },
            ]}
          />
        </Stack>
      ) : null}
    </DocumentDetailLayout>
  );
}
