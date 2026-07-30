import { useEffect } from 'react';
import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom';
import { Box, Button, Link, Stack, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';

import { useGetLineageTraceQuery } from '@/api/endpoints/traceApi';
import { ApiErrorAlert } from '@/components/ApiErrorAlert';
import { DecimalDisplay } from '@/components/DecimalDisplay';
import { PermissionGate } from '@/components/PermissionGate';
import { RequestLineCancelledBadge } from '@/components/RequestLineCancelledBadge';
import { LineageEventsPanel } from '@/features/trace/components/LineageEventsPanel';
import { LineagePipelineView } from '@/features/trace/components/LineagePipelineView';
import { useAppSelector } from '@/hooks/useAppSelector';
import { BackLink } from '@/components/BackLink';
import { PageShell } from '@/layouts/PageShell';

export function TraceDetailPage() {
  const { t } = useTranslation('trace');
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { lineageId } = useParams<{ lineageId: string }>();
  const companyId = useAppSelector((state) => state.auth.activeCompanyId);

  const traceQuery = useGetLineageTraceQuery(
    { companyId: companyId ?? '', lineageId: lineageId ?? '' },
    { skip: !companyId || !lineageId },
  );

  const trace = traceQuery.data;

  useEffect(() => {
    if (
      traceQuery.isError &&
      'status' in traceQuery.error &&
      traceQuery.error.status === 404
    ) {
      enqueueSnackbar(t('detail.notFound'), { variant: 'error' });
      navigate('/app/trace', { replace: true });
    }
  }, [traceQuery.isError, traceQuery.error, enqueueSnackbar, navigate, t]);

  if (!companyId || !lineageId) {
    return null;
  }

  return (
    <PageShell maxWidth="lg">
      <PermissionGate permission="viewTrace">
        <Stack spacing={4}>
          <BackLink to="/app" />
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="flex-start"
          >
            <Box>
              <Typography variant="h5" component="h1">
                {t('detail.title')}
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ fontFamily: 'monospace', mt: 0.5 }}
              >
                {lineageId}
              </Typography>
            </Box>
          </Stack>

          <ApiErrorAlert error={traceQuery.error} />

          {traceQuery.isLoading ? (
            <Typography color="text.secondary">
              {t('detail.loading')}
            </Typography>
          ) : null}

          {trace ? (
            <>
              <Stack spacing={1}>
                <Stack
                  direction="row"
                  spacing={1}
                  alignItems="center"
                  flexWrap="wrap"
                >
                  <Typography variant="body1">
                    {trace.requestLine.description}
                  </Typography>
                  <RequestLineCancelledBadge
                    cancelledAt={trace.requestLine.cancelledAt}
                  />
                </Stack>
              </Stack>

              <LineagePipelineView trace={trace} />

              <LineageEventsPanel companyId={companyId} lineageId={lineageId} />
            </>
          ) : null}
        </Stack>
      </PermissionGate>
    </PageShell>
  );
}
