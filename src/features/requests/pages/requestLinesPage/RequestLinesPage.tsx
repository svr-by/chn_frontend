import { useEffect, useMemo, useState, type SyntheticEvent } from 'react';
import {
  Badge,
  Box,
  IconButton,
  Stack,
  Tab,
  Tabs,
  Typography,
} from '@mui/material';
import FilterListOutlinedIcon from '@mui/icons-material/FilterListOutlined';
import { useTranslation } from 'react-i18next';

import { useListMembersQuery } from '@/api/endpoints/membersApi';
import { InboundRequestLinesPanel } from '@/features/requests/components/inboundRequestLinesPanel/InboundRequestLinesPanel';
import { OutboundRequestLinesPanel } from '@/features/requests/components/outboundRequestLinesPanel/OutboundRequestLinesPanel';
import { RequestLinesFiltersPanel } from '@/features/requests/components/requestLinesFilters/RequestLinesFiltersPanel';
import {
  DEFAULT_REQUEST_LINES_FILTERS,
  clearFiltersOnTabChange,
  countActiveRequestLinesFilters,
  requestLineStatusOptionsForTab,
  type RequestLinesFiltersValue,
} from '@/features/requests/lib/requestLinesFilters';
import { useAppSelector } from '@/hooks/useAppSelector';
import { usePreferredListDirection } from '@/hooks/usePreferredListDirection';
import { PageShell } from '@/layouts/pageShell/PageShell';
import type { ListDirection } from '@/lib/preferredDirection';

export function RequestLinesPage() {
  const { t } = useTranslation('requests');
  const companyId = useAppSelector((state) => state.auth.activeCompanyId);
  const { direction: tab, setDirection } = usePreferredListDirection({
    paramName: 'tab',
    absentMeans: 'outbound',
    family: 'requests',
  });

  const [filtersOpen, setFiltersOpen] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState<RequestLinesFiltersValue>(
    { ...DEFAULT_REQUEST_LINES_FILTERS },
  );
  const [draftFilters, setDraftFilters] = useState<RequestLinesFiltersValue>({
    ...DEFAULT_REQUEST_LINES_FILTERS,
  });

  const membersQuery = useListMembersQuery(
    { companyId: companyId ?? '' },
    { skip: !companyId },
  );

  useEffect(() => {
    setAppliedFilters((prev) => clearFiltersOnTabChange(tab, prev));
    setDraftFilters((prev) => clearFiltersOnTabChange(tab, prev));
  }, [tab]);

  const statusOptions = requestLineStatusOptionsForTab(tab);
  const activeFiltersCount = countActiveRequestLinesFilters(appliedFilters, tab);

  const createdByOptions = useMemo(() => {
    const members = (membersQuery.data?.members ?? []).filter(
      (member) => member.user,
    );

    return [
      { label: t('statusFilter.all'), value: '' },
      ...members.map((member) => {
        const user = member.user!;
        const name = [user.firstName, user.lastName]
          .filter(Boolean)
          .join(' ')
          .trim();

        return {
          label: name || user.email,
          value: user.id,
        };
      }),
    ];
  }, [membersQuery.data?.members, t]);

  if (!companyId) {
    return null;
  }

  function handleTabChange(_event: SyntheticEvent, value: ListDirection) {
    setDirection(value);
  }

  return (
    <PageShell maxWidth="xl">
      <Stack spacing={3}>
        <Stack spacing={0}>
          <Box>
            <Typography variant="h5" component="h1">
              {t('requestLines.title')}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {tab === 'outbound'
                ? t('requestLines.subtitle')
                : t('requestLines.inbound.subtitle')}
            </Typography>
          </Box>

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
              aria-label={t('requestLines.filters.open')}
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

        <RequestLinesFiltersPanel
          draftFilters={draftFilters}
          appliedFilters={appliedFilters}
          statusOptions={statusOptions}
          createdByOptions={createdByOptions}
          showExtendedFilters={tab === 'outbound'}
          drawerOpen={filtersOpen}
          onDrawerOpenChange={setFiltersOpen}
          onDraftChange={setDraftFilters}
          onApply={() => setAppliedFilters(draftFilters)}
          onReset={() => {
            setDraftFilters({ ...DEFAULT_REQUEST_LINES_FILTERS });
            setAppliedFilters({ ...DEFAULT_REQUEST_LINES_FILTERS });
          }}
        />

        {tab === 'outbound' ? (
          <OutboundRequestLinesPanel
            companyId={companyId}
            filters={appliedFilters}
          />
        ) : (
          <InboundRequestLinesPanel
            companyId={companyId}
            filters={appliedFilters}
          />
        )}
      </Stack>
    </PageShell>
  );
}
