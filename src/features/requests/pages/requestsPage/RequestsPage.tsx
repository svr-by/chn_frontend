import { useEffect, useState, type SyntheticEvent } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Badge,
  Box,
  Button,
  CircularProgress,
  IconButton,
  Stack,
  Tab,
  Tabs,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import FilterListOutlinedIcon from '@mui/icons-material/FilterListOutlined';
import { useTranslation } from 'react-i18next';

import {
  useListInboundRequestsQuery,
  useListRequestsQuery,
} from '@/api/endpoints/requestsApi';
import { ApiErrorAlert } from '@/components/ApiErrorAlert';
import { ListPagination } from '@/components/ListPagination';
import { PermissionGate } from '@/components/PermissionGate';
import { RequestCard } from '@/features/requests/components/requestCard/RequestCard';
import { RequestsFiltersPanel } from '@/features/requests/components/requestsFilters/RequestsFiltersPanel';
import {
  DEFAULT_REQUESTS_FILTERS,
  buildInboundRequestsQueryArgs,
  buildOutboundRequestsQueryArgs,
  clearFiltersOnTabChange,
  countActiveRequestsFilters,
  requestStatusOptionsForTab,
  type RequestsFiltersValue,
  type RequestsTab,
} from '@/features/requests/lib/requestsFilters';
import { useAppSelector } from '@/hooks/useAppSelector';
import { usePermissions } from '@/hooks/usePermissions';
import { usePreferredListDirection } from '@/hooks/usePreferredListDirection';
import { PageShell } from '@/layouts/PageShell';

const PAGE_SIZE = 20;

export function RequestsPage() {
  const { t } = useTranslation('requests');
  const navigate = useNavigate();
  const companyId = useAppSelector((state) => state.auth.activeCompanyId);
  const { user } = usePermissions();
  const { direction: tab, setDirection } = usePreferredListDirection({
    paramName: 'tab',
    absentMeans: 'outbound',
    family: 'requests',
  });

  const [pageIndex, setPageIndex] = useState(0);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState<RequestsFiltersValue>({
    ...DEFAULT_REQUESTS_FILTERS,
  });
  const [draftFilters, setDraftFilters] = useState<RequestsFiltersValue>({
    ...DEFAULT_REQUESTS_FILTERS,
  });

  useEffect(() => {
    setAppliedFilters((prev) => clearFiltersOnTabChange(tab, prev));
    setDraftFilters((prev) => clearFiltersOnTabChange(tab, prev));
  }, [tab]);

  useEffect(() => {
    setPageIndex(0);
  }, [tab, appliedFilters]);

  const outboundQuery = useListRequestsQuery(
    buildOutboundRequestsQueryArgs({
      companyId: companyId ?? '',
      limit: PAGE_SIZE,
      offset: pageIndex * PAGE_SIZE,
      filters: appliedFilters,
      currentUserId: user?.id,
    }),
    { skip: !companyId || tab !== 'outbound' },
  );

  const inboundQuery = useListInboundRequestsQuery(
    buildInboundRequestsQueryArgs({
      companyId: companyId ?? '',
      limit: PAGE_SIZE,
      offset: pageIndex * PAGE_SIZE,
      filters: appliedFilters,
    }),
    { skip: !companyId || tab !== 'inbound' },
  );

  const listQuery = tab === 'outbound' ? outboundQuery : inboundQuery;

  if (!companyId) {
    return null;
  }

  function handleTabChange(_event: SyntheticEvent, value: RequestsTab) {
    setDirection(value);
  }

  const requests = listQuery.data?.requests ?? [];
  const total = listQuery.data?.pagination.total ?? 0;
  const statusOptions = requestStatusOptionsForTab(tab);
  const activeFiltersCount = countActiveRequestsFilters(appliedFilters, tab);

  return (
    <PageShell maxWidth="xl" fillViewport>
      <Stack spacing={3} sx={{ flex: 1, minHeight: 0 }}>
        <Stack spacing={0}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            justifyContent="space-between"
            alignItems={{ xs: 'stretch', sm: 'flex-start' }}
            spacing={2}
          >
            <Box>
              <Typography variant="h5" component="h1">
                {t('title')}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {tab === 'outbound' ? t('subtitle') : t('inbound.subtitle')}
              </Typography>
            </Box>
            {tab === 'outbound' ? (
              <PermissionGate permission="manageRequests">
                <Button
                  variant="contained"
                  component={RouterLink}
                  to="/app/requests/new"
                  startIcon={<AddIcon />}
                >
                  {t('actions.new')}
                </Button>
              </PermissionGate>
            ) : null}
          </Stack>

          <Stack direction="row" alignItems="center" spacing={1}>
            <Tabs
              value={tab}
              onChange={handleTabChange}
              sx={{ flex: 1, minWidth: 0 }}
            >
              <Tab label={t('tabs.outbound')} value="outbound" />
              <Tab label={t('tabs.inbound')} value="inbound" />
            </Tabs>
            <IconButton
              aria-label={t('filters.open')}
              onClick={() => setFiltersOpen(true)}
              sx={{ flexShrink: 0 }}
            >
              <Badge
                badgeContent={activeFiltersCount}
                color="primary"
                invisible={activeFiltersCount === 0}
              >
                <FilterListOutlinedIcon />
              </Badge>
            </IconButton>
          </Stack>
        </Stack>

        <ApiErrorAlert error={listQuery.error} />

        <RequestsFiltersPanel
          draftFilters={draftFilters}
          appliedFilters={appliedFilters}
          statusOptions={statusOptions}
          showExtendedFilters={tab === 'outbound'}
          drawerOpen={filtersOpen}
          onDrawerOpenChange={setFiltersOpen}
          onDraftChange={setDraftFilters}
          onApply={() => setAppliedFilters(draftFilters)}
          onReset={() => {
            setDraftFilters({ ...DEFAULT_REQUESTS_FILTERS });
            setAppliedFilters({ ...DEFAULT_REQUESTS_FILTERS });
          }}
        />

        {listQuery.isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress />
          </Box>
        ) : requests.length === 0 ? (
          <Typography color="text.secondary">
            {tab === 'outbound' ? t('empty.list') : t('inbound.empty.list')}
          </Typography>
        ) : (
          <Stack spacing={0} sx={{ flex: 1, minHeight: 0 }}>
            <Stack
              spacing={1.5}
              sx={{
                flex: 1,
                opacity: listQuery.isFetching ? 0.6 : 1,
                transition: 'opacity 120ms ease',
              }}
            >
              {tab === 'outbound'
                ? (outboundQuery.data?.requests ?? []).map((request) => (
                    <RequestCard
                      key={request.id}
                      tab="outbound"
                      request={request}
                      onClick={() => navigate(`/app/requests/${request.id}`)}
                    />
                  ))
                : (inboundQuery.data?.requests ?? []).map((request) => (
                    <RequestCard
                      key={request.id}
                      tab="inbound"
                      request={request}
                      onClick={() =>
                        navigate(`/app/requests/inbound/${request.id}`)
                      }
                    />
                  ))}
            </Stack>

            <ListPagination
              count={total}
              page={pageIndex}
              onPageChange={setPageIndex}
              rowsPerPage={PAGE_SIZE}
            />
          </Stack>
        )}
      </Stack>
    </PageShell>
  );
}
