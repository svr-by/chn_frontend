import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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

import { TradingPartnerStatus } from '@/api/generated/models/tradingPartnerStatus';
import { useListQuotesQuery } from '@/api/endpoints/quotesApi';
import { useListPartnersQuery } from '@/api/endpoints/partnersApi';
import { ApiErrorAlert } from '@/components/ApiErrorAlert';
import { ListPagination } from '@/components/ListPagination';
import { PermissionGate } from '@/components/PermissionGate';
import { useAppSelector } from '@/hooks/useAppSelector';
import { usePreferredListDirection } from '@/hooks/usePreferredListDirection';
import { CreateQuoteFromInboundDialog } from '@/features/quotes/components/createQuoteFromInboundDialog/CreateQuoteFromInboundDialog';
import { QuoteCard } from '@/features/quotes/components/quoteCard/QuoteCard';
import { QuotesFiltersPanel } from '@/features/quotes/components/quotesFilters/QuotesFiltersPanel';
import {
  DEFAULT_QUOTES_FILTERS,
  clearCounterpartyOnDirectionChange,
  buildQuotesListQueryArgs,
  countActiveQuotesFilters,
  type QuotesFiltersValue,
} from '@/features/quotes/lib/quotesFilters';
import { PageShell } from '@/layouts/pageShell/PageShell';
import type { ListDirection } from '@/lib/preferredDirection';

const PAGE_SIZE = 20;

const DIRECTION_TABS: ListDirection[] = ['inbound', 'outbound'];

export function QuotesPage() {
  const { t } = useTranslation('quotes');
  const navigate = useNavigate();
  const companyId = useAppSelector((state) => state.auth.activeCompanyId);
  const { direction, setDirection } = usePreferredListDirection({
    paramName: 'direction',
    absentMeans: 'inbound',
    family: 'documents',
  });

  const tabIndex = direction === 'outbound' ? 1 : 0;

  const [pageIndex, setPageIndex] = useState(0);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState<QuotesFiltersValue>({
    ...DEFAULT_QUOTES_FILTERS,
  });
  const [draftFilters, setDraftFilters] = useState<QuotesFiltersValue>({
    ...DEFAULT_QUOTES_FILTERS,
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
  }, [direction, appliedFilters]);

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

  const listQuery = useListQuotesQuery(
    buildQuotesListQueryArgs({
      companyId: companyId ?? '',
      direction,
      limit: PAGE_SIZE,
      offset: pageIndex * PAGE_SIZE,
      filters: appliedFilters,
    }),
    { skip: !companyId },
  );

  function handleTabChange(_event: React.SyntheticEvent, value: number) {
    setDirection(DIRECTION_TABS[value]);
  }

  if (!companyId) {
    return null;
  }

  const quotes = listQuery.data?.quotes ?? [];
  const total = listQuery.data?.pagination.total ?? 0;
  const activeFiltersCount = countActiveQuotesFilters(appliedFilters);

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
                {t('subtitle')}
              </Typography>
            </Box>
            {direction === 'outbound' ? (
              <PermissionGate permission="manageQuotes">
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => setCreateOpen(true)}
                >
                  {t('actions.new')}
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

        <QuotesFiltersPanel
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
            setDraftFilters({ ...DEFAULT_QUOTES_FILTERS });
            setAppliedFilters({ ...DEFAULT_QUOTES_FILTERS });
          }}
        />

        {listQuery.isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress />
          </Box>
        ) : quotes.length === 0 ? (
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
              {quotes.map((quote) => (
                <QuoteCard
                  key={quote.id}
                  quote={quote}
                  direction={direction}
                  onClick={() => navigate(`/app/quotes/${quote.id}`)}
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

      <CreateQuoteFromInboundDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        companyId={companyId}
      />
    </PageShell>
  );
}
