import { useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Box, Stack, Tab, Tabs, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';

import { useGetLineageTraceQuery } from '@/api/endpoints/traceApi';
import { ApiErrorAlert } from '@/components/feedback/apiErrorAlert/ApiErrorAlert';
import { PermissionGate } from '@/components/auth/permissionGate/PermissionGate';
import { RequestLineCancelledBadge } from '@/components/status/requestLineCancelledBadge/RequestLineCancelledBadge';
import { LineageEventsPanel } from '@/features/trace/components/lineageEventsPanel/LineageEventsPanel';
import { LineagePipelineView } from '@/features/trace/components/lineagePipelineView/LineagePipelineView';
import { useAppSelector } from '@/hooks/useAppSelector';
import { BackLink } from '@/components/navigation/backLink/BackLink';
import { PageShell } from '@/layouts/pageShell/PageShell';

const TAB_KEYS = ['pipeline', 'events'] as const;
type TabKey = (typeof TAB_KEYS)[number];

function isTabKey(value: string | null): value is TabKey {
  return TAB_KEYS.includes(value as TabKey);
}

export function TraceDetailPage() {
  const { t } = useTranslation('trace');
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { lineageId } = useParams<{ lineageId: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const companyId = useAppSelector((state) => state.auth.activeCompanyId);
  const tabParam = searchParams.get('tab');
  const activeTab: TabKey = isTabKey(tabParam) ? tabParam : 'pipeline';

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

              <Box>
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                  <Tabs
                    value={activeTab}
                    onChange={(_event, value: TabKey) => {
                      const nextParams = new URLSearchParams(searchParams);
                      if (value === 'pipeline') {
                        nextParams.delete('tab');
                      } else {
                        nextParams.set('tab', value);
                      }
                      setSearchParams(nextParams, { replace: true });
                    }}
                    aria-label={t('tabs.ariaLabel')}
                  >
                    <Tab value="pipeline" label={t('tabs.pipeline')} />
                    <Tab value="events" label={t('tabs.events')} />
                  </Tabs>
                </Box>

                {activeTab === 'pipeline' ? (
                  <Box sx={{ pt: 3 }}>
                    <LineagePipelineView trace={trace} />
                  </Box>
                ) : null}

                {activeTab === 'events' ? (
                  <Box sx={{ pt: 3 }}>
                    <LineageEventsPanel
                      companyId={companyId}
                      lineageId={lineageId}
                    />
                  </Box>
                ) : null}
              </Box>
            </>
          ) : null}
        </Stack>
      </PermissionGate>
    </PageShell>
  );
}
