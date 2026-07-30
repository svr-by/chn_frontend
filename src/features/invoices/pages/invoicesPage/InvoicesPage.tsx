import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Box,
  Button,
  CircularProgress,
  IconButton,
  Stack,
  Tab,
  Tabs,
  Typography,
  useMediaQuery,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import FilterListOutlinedIcon from '@mui/icons-material/FilterListOutlined';
import { useTranslation } from 'react-i18next';

import type { GetCompaniesCompanyIdInvoicesDirection } from '@/api/generated/models/getCompaniesCompanyIdInvoicesDirection';
import { TradingPartnerStatus } from '@/api/generated/models/tradingPartnerStatus';
import { useListInvoicesQuery } from '@/api/endpoints/invoicesApi';
import { useListPartnersQuery } from '@/api/endpoints/partnersApi';
import { ApiErrorAlert } from '@/components/ApiErrorAlert';
import { ListPagination } from '@/components/ListPagination';
import { PermissionGate } from '@/components/PermissionGate';
import { InvoiceCreateDialog } from '@/features/invoices/components/InvoiceCreateDialog';
import { InvoiceCard } from '@/features/invoices/components/invoiceCard/InvoiceCard';
import { InvoicesFiltersPanel } from '@/features/invoices/components/invoicesFilters/InvoicesFiltersPanel';
import {
  DEFAULT_INVOICES_FILTERS,
  clearCounterpartyOnDirectionChange,
  buildInvoicesListQueryArgs,
  type InvoicesFiltersValue,
} from '@/features/invoices/lib/invoicesFilters';
import { useAppSelector } from '@/hooks/useAppSelector';
import { PageShell } from '@/layouts/PageShell';

const PAGE_SIZE = 20;

const DIRECTION_TABS: GetCompaniesCompanyIdInvoicesDirection[] = [
  'inbound',
  'outbound',
];

export function InvoicesPage() {
  const { t } = useTranslation('invoices');
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const companyId = useAppSelector((state) => state.auth.activeCompanyId);

  const directionParam = searchParams.get('direction');
  const direction: GetCompaniesCompanyIdInvoicesDirection =
    directionParam === 'outbound' ? 'outbound' : 'inbound';
  const requestIdFilter = searchParams.get('requestId') ?? undefined;

  const tabIndex = direction === 'outbound' ? 1 : 0;
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [pageIndex, setPageIndex] = useState(0);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
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
    const nextDirection = DIRECTION_TABS[value];
    const params = new URLSearchParams(searchParams);
    params.set('direction', nextDirection);
    setSearchParams(params);
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

  return (
    <PageShell maxWidth="xl" fillViewport>
      <Stack spacing={3} sx={{ flex: 1, minHeight: 0 }}>
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
              <Button variant="contained" onClick={() => setCreateOpen(true)}>
                {t('actions.create')}
              </Button>
            </PermissionGate>
          ) : null}
        </Stack>

        <Stack direction="row" alignItems="center" spacing={1}>
          <Tabs
            value={tabIndex}
            onChange={handleTabChange}
            sx={{ flex: 1, minWidth: 0 }}
          >
            <Tab label={t('tabs.inbound')} />
            <Tab label={t('tabs.outbound')} />
          </Tabs>
          {isMobile ? (
            <IconButton
              aria-label={t('filters.open')}
              onClick={() => setFiltersOpen(true)}
              sx={{ flexShrink: 0 }}
            >
              <FilterListOutlinedIcon />
            </IconButton>
          ) : null}
        </Stack>

        {requestIdFilter ? (
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
        ) : null}

        <ApiErrorAlert error={listQuery.error} />

        <InvoicesFiltersPanel
          direction={direction}
          draftFilters={draftFilters}
          appliedFilters={appliedFilters}
          partners={activePartners}
          partnersLoading={partnersQuery.isLoading || partnersQuery.isFetching}
          inline={!isMobile}
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

        <InvoiceCreateDialog
          open={createOpen}
          onClose={() => setCreateOpen(false)}
          initialRequestId={requestIdFilter}
        />
      </Stack>
    </PageShell>
  );
}
