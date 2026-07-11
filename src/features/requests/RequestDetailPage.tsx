import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Stack, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';

import { useGetRequestQuery } from '@/api/endpoints/requestsApi';
import { DocumentDetailLayout } from '@/layouts/DocumentDetailLayout';
import { RequestHeaderForm } from '@/features/requests/RequestHeaderForm';
import { RequestLinesTable } from '@/features/requests/RequestLinesTable';
import { RequestStatusActions } from '@/features/requests/RequestStatusActions';
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
  const isDraft = request?.status === 'DRAFT';
  const canEdit = isDraft && hasPermission('manageRequests');

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
    request?.title ??
    request?.reference ??
    t('detail.fallbackTitle', { id: requestId.slice(0, 8) });

  const subtitle = request?.reference
    ? t('detail.reference', { reference: request.reference })
    : null;

  return (
    <DocumentDetailLayout
      title={title}
      subtitle={subtitle}
      status={request?.status}
      backTo="/app/requests"
      backLabel={t('actions.backToList')}
      loading={requestQuery.isLoading}
      error={requestQuery.error}
      actions={
        request ? (
          <RequestStatusActions
            companyId={companyId}
            requestId={request.id}
            status={request.status}
          />
        ) : null
      }
      meta={
        request ? (
          <Stack spacing={0.5}>
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
        <Stack spacing={4}>
          <RequestHeaderForm
            companyId={companyId}
            request={request}
            editable={canEdit}
          />
          <RequestLinesTable
            companyId={companyId}
            requestId={request.id}
            lines={request.lines}
            editable={canEdit}
          />
        </Stack>
      ) : null}
    </DocumentDetailLayout>
  );
}
