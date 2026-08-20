import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Badge,
  Box,
  Button,
  CircularProgress,
  Divider,
  IconButton,
  Stack,
  Tab,
  Tabs,
  Typography,
} from '@mui/material';
import FilterListOutlinedIcon from '@mui/icons-material/FilterListOutlined';
import AddIcon from '@mui/icons-material/Add';
import { useTranslation } from 'react-i18next';

import { TradingPartnerStatus } from '@/api/generated/models/tradingPartnerStatus';
import { useListInvoicesQuery } from '@/api/endpoints/invoicesApi';
import { useListPartnersQuery } from '@/api/endpoints/partnersApi';
import { ApiErrorAlert } from '@/components/feedback/apiErrorAlert/ApiErrorAlert';
import { ListPagination } from '@/components/tables/listPagination/ListPagination';
import { PermissionGate } from '@/components/auth/permissionGate/PermissionGate';
import { InvoiceCard } from '@/features/invoices/components/invoiceCard/InvoiceCard';
import { InvoicesFiltersPanel } from '@/features/invoices/components/invoicesFilters/InvoicesFiltersPanel';
import {
  DEFAULT_INVOICES_FILTERS,
  clearCounterpartyOnDirectionChange,
  buildInvoicesListQueryArgs,
  countActiveInvoicesFilters,
  type InvoicesFiltersValue,
} from '@/features/invoices/lib/invoicesFilters';
import { useAppSelector } from '@/hooks/useAppSelector';
import { usePreferredListDirection } from '@/hooks/usePreferredListDirection';
import { PageShell } from '@/layouts/pageShell/PageShell';
import type { ListDirection } from '@/lib/preferredDirection';

const PAGE_SIZE = 20;

const DIRECTION_TABS: ListDirection[] = ['inbound', 'outbound'];

export function InvoicesPage() {
  const { t } = useTranslation('invoices');
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const companyId = useAppSelector((state) => state.auth.activeCompanyId);
  const { direction, setDirection } = usePreferredListDirection({
    paramName: 'direction',
    absentMeans: 'inbound',
    family: 'documents',
  });
  const requestIdFilter = searchParams.get('requestId') ?? undefined;

  const tabIndex = direction === 'outbound' ? 1 : 0;

  const [pageIndex, setPageIndex] = useState(0);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState<InvoicesFiltersValue>({
    ...DEFAULT_INVOICES_FILTERS,
  });
  const [draftFilters, setDraftFilters] = useState<InvoicesFiltersValue>({
    ...DEFAULT_INVOICES_FILTERS,
  });

  useEffect(() => {
    setAppliedFilters((prev) =>
      clearCounterpartyOnDirectionChange(direction, prev),
    );
    setDraftFilters((prev) =>
      clearCounterpartyOnDirectionChange(direction, prev),
    );
  }, [direction]);

  useEffect(() => {
    setPageIndex(0);
  }, [direction, appliedFilters, requestIdFilter]);

  const partnersQuery = useListPartnersQuery(
    { companyId: companyId ?? '' },
    { skip: !companyId },
  );

  const activePartners = useMemo(
    () =>
      (partnersQuery.data?.partners ?? []).filter(
        (p) => p.status === TradingPartnerStatus.ACTIVE,
      ),
    [partnersQuery.data?.partners],
  );

  const listQuery = useListInvoicesQuery(
    buildInvoicesListQueryArgs({
      companyId: companyId ?? '',
      direction,
      limit: PAGE_SIZE,
      offset: pageIndex * PAGE_SIZE,
      filters: appliedFilters,
      requestId: requestIdFilter,
    }),
    { skip: !companyId },
  );

  function handleTabChange(_event: React.SyntheticEvent, value: number) {
    setDirection(DIRECTION_TABS[value]);
  }

  function clearRequestFilter() {
    const params = new URLSearchParams(searchParams);
    params.delete('requestId');
    setSearchParams(params);
  }

  if (!companyId) {
    return null;
  }

  const invoices = listQuery.data?.invoices ?? [];
  const total = listQuery.data?.pagination.total ?? 0;
  const activeFiltersCount = countActiveInvoicesFilters(appliedFilters);

  return (
    <PageShell maxWidth="xl" fillViewport>
      <Stack spacing={3} sx={{ flex: 1, minHeight: 0 }}>
        <Stack spacing={0}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="flex-start"
          >
            <Box>
              <Typography variant="h5" component="h1">
                {t('title')}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t('subtitle')}
              </Typography>
            </Box>
            {direction === 'outbound' ? (
              <PermissionGate permission="manageInvoices">
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() =>
                    navigate(
                      requestIdFilter
                        ? `/app/invoices/new?requestId=${requestIdFilter}`
                        : '/app/invoices/new',
                    )
                  }
                >
                  {t('actions.create')}
                </Button>
              </PermissionGate>
            ) : null}
          </Stack>

          <Stack direction="row" alignItems="center" spacing={1}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider', flex: 1, minWidth: 0 }}>
              <Tabs
                value={tabIndex}
                onChange={handleTabChange}
                variant="scrollable"
                scrollButtons="auto"
                aria-label={t('tabs.ariaLabel')}
              >
                <Tab label={t('tabs.inbound')} />
                <Tab label={t('tabs.outbound')} />
              </Tabs>
            </Box>
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

        {requestIdFilter ? (
          <Stack spacing={0.5}>
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography variant="body2" color="text.secondary">
                {t('filter.request', { id: requestIdFilter.slice(0, 8) })}
              </Typography>
              <Typography
                component="button"
                variant="body2"
                onClick={clearRequestFilter}
                sx={{
                  cursor: 'pointer',
                  border: 'none',
                  background: 'none',
                  color: 'primary.main',
                }}
              >
                {t('filter.clearRequest')}
              </Typography>
            </Stack>
            <Typography variant="caption" color="text.secondary">
              {t('filter.requestHint')}
            </Typography>
          </Stack>
        ) : null}

        <ApiErrorAlert error={listQuery.error} />

        <InvoicesFiltersPanel
          direction={direction}
          draftFilters={draftFilters}
          appliedFilters={appliedFilters}
          partners={activePartners}
          partnersLoading={partnersQuery.isLoading || partnersQuery.isFetching}
          drawerOpen={filtersOpen}
          onDrawerOpenChange={setFiltersOpen}
          onDraftChange={setDraftFilters}
          onApply={() => setAppliedFilters(draftFilters)}
          onReset={() => {
            setDraftFilters({ ...DEFAULT_INVOICES_FILTERS });
            setAppliedFilters({ ...DEFAULT_INVOICES_FILTERS });
          }}
        />

        {listQuery.isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress />
          </Box>
        ) : invoices.length === 0 ? (
          <Typography color="text.secondary">{t('empty.list')}</Typography>
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
              {invoices.map((invoice) => (
                <InvoiceCard
                  key={invoice.id}
                  invoice={invoice}
                  direction={direction}
                  onClick={() => navigate(`/app/invoices/${invoice.id}`)}
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
