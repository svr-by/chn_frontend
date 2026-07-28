import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Box,
  CircularProgress,
  IconButton,
  Stack,
  Tab,
  TablePagination,
  Tabs,
  Typography,
  useMediaQuery,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import FilterListOutlinedIcon from '@mui/icons-material/FilterListOutlined';
import { useTranslation } from 'react-i18next';

import type { GetCompaniesCompanyIdQuotesDirection } from '@/api/generated/models/getCompaniesCompanyIdQuotesDirection';
import { TradingPartnerStatus } from '@/api/generated/models/tradingPartnerStatus';
import { useListQuotesQuery } from '@/api/endpoints/quotesApi';
import { useListPartnersQuery } from '@/api/endpoints/partnersApi';
import { ApiErrorAlert } from '@/components/ApiErrorAlert';
import { useAppSelector } from '@/hooks/useAppSelector';
import { QuoteCard } from '@/features/quotes/components/quoteCard/QuoteCard';
import { QuotesFiltersPanel } from '@/features/quotes/components/quotesFilters/QuotesFiltersPanel';
import {
  DEFAULT_QUOTES_FILTERS,
  clearCounterpartyOnDirectionChange,
  buildQuotesListQueryArgs,
  type QuotesFiltersValue,
} from '@/features/quotes/lib/quotesFilters';

const PAGE_SIZE = 20;

const DIRECTION_TABS: GetCompaniesCompanyIdQuotesDirection[] = [
  'inbound',
  'outbound',
];

export function QuotesPage() {
  const { t } = useTranslation('quotes');
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const companyId = useAppSelector((state) => state.auth.activeCompanyId);

  const directionParam = searchParams.get('direction');
  const direction: GetCompaniesCompanyIdQuotesDirection =
    directionParam === 'outbound' ? 'outbound' : 'inbound';

  const tabIndex = direction === 'outbound' ? 1 : 0;
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [pageIndex, setPageIndex] = useState(0);
  const [filtersOpen, setFiltersOpen] = useState(false);
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
    setDraftFilters((prev) => clearCounterpartyOnDirectionChange(direction, prev));
  }, [direction]);

  useEffect(() => {
    setPageIndex(0);
  }, [direction, appliedFilters]);

  const partnersQuery = useListPartnersQuery(
    { companyId: companyId ?? '' },
    { skip: !companyId },
  );

  const activePartners = useMemo(
    () => (partnersQuery.data?.partners ?? []).filter((p) => p.status === TradingPartnerStatus.ACTIVE),
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
    const nextDirection = DIRECTION_TABS[value];
    const params = new URLSearchParams(searchParams);
    params.set('direction', nextDirection);
    setSearchParams(params);
  }

  if (!companyId) {
    return null;
  }

  const quotes = listQuery.data?.quotes ?? [];
  const total = listQuery.data?.pagination.total ?? 0;

  return (
    <Stack spacing={3} sx={{ minHeight: '100%' }}>
      <Box>
        <Typography variant="h5" component="h1">
          {t('title')}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {t('subtitle')}
        </Typography>
      </Box>

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

      <ApiErrorAlert error={listQuery.error} />

      <QuotesFiltersPanel
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

          <TablePagination
            component="div"
            count={total}
            page={pageIndex}
            onPageChange={(_event, nextPage) => setPageIndex(nextPage)}
            rowsPerPage={PAGE_SIZE}
            rowsPerPageOptions={[PAGE_SIZE]}
            onRowsPerPageChange={() => undefined}
            sx={{
              mt: 'auto',
              borderTop: 1,
              borderColor: 'divider',
              '.MuiToolbar-root': { px: 0 },
            }}
          />
        </Stack>
      )}
    </Stack>
  );
}
