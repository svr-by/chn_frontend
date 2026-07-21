import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Stack, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';

import { useGetInboundRequestQuery } from '@/api/endpoints/requestsApi';
import { DecimalDisplay } from '@/components/DecimalDisplay';
import { DocumentDetailLayout } from '@/layouts/DocumentDetailLayout';
import { StatusBadge } from '@/components/StatusBadge';
import { InboundRequestStatusActions } from '@/features/requests/components/InboundRequestStatusActions';
import { useAppSelector } from '@/hooks/useAppSelector';

export function InboundRequestDetailPage() {
  const { t } = useTranslation('requests');
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { requestId } = useParams<{ requestId: string }>();
  const companyId = useAppSelector((state) => state.auth.activeCompanyId);

  const requestQuery = useGetInboundRequestQuery(
    { companyId: companyId ?? '', requestId: requestId ?? '' },
    { skip: !companyId || !requestId },
  );

  const request = requestQuery.data?.request;

  useEffect(() => {
    if (
      requestQuery.isError &&
      'status' in requestQuery.error &&
      requestQuery.error.status === 404
    ) {
      enqueueSnackbar(t('inbound.toast.notFound'), { variant: 'error' });
      navigate('/app/requests?tab=inbound', { replace: true });
    }
  }, [requestQuery.isError, requestQuery.error, enqueueSnackbar, navigate, t]);

  if (!companyId || !requestId) {
    return null;
  }

  const title =
    request?.title ??
    t('detail.fallbackTitle', { id: requestId.slice(0, 8) });

  return (
    <DocumentDetailLayout
      title={title}
      statusBadge={request?.status ? <StatusBadge status={request.status} /> : undefined}
      loading={requestQuery.isLoading}
      error={requestQuery.error}
      backFallbackTo="/app/requests?tab=inbound"
      actions={
        request ? (
          <InboundRequestStatusActions
            companyId={companyId}
            requestId={request.id}
          />
        ) : null
      }
      meta={
        request ? (
          <Stack spacing={0.5}>
            <Typography variant="body2" color="text.secondary">
              {t('inbound.columns.buyer')}: {request.buyerCompany.name}
            </Typography>
            {request.distributedAt ? (
              <Typography variant="body2" color="text.secondary">
                {t('inbound.columns.distributedAt')}:{' '}
                {new Date(request.distributedAt).toLocaleString()}
              </Typography>
            ) : null}
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
        <Stack spacing={2}>
          <Typography variant="h6">{t('linesTitle')}</Typography>
          {request.lines.length === 0 ? (
            <Typography color="text.secondary">{t('empty.lines')}</Typography>
          ) : (
            request.lines.map((line) => (
              <Stack
                key={line.id}
                spacing={0.5}
                sx={{
                  p: 2,
                  border: 1,
                  borderColor: 'divider',
                  borderRadius: 1,
                }}
              >
                <Typography variant="subtitle2">
                  {line.lineNumber}. {line.description}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  <DecimalDisplay value={line.quantity} /> {line.unit ?? ''}
                </Typography>
                {line.product?.name ? (
                  <Typography variant="body2" color="text.secondary">
                    {line.product.name}
                  </Typography>
                ) : null}
              </Stack>
            ))
          )}
        </Stack>
      ) : null}
    </DocumentDetailLayout>
  );
}
