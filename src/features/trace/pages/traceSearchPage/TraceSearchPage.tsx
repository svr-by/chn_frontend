import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Box,
  Button,
  Chip,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import type { MRT_ColumnDef, MRT_PaginationState } from 'material-react-table';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { useTranslation } from 'react-i18next';

import type { TraceSearchItem } from '@/api/generated/models/traceSearchItem';
import { GetCompaniesCompanyIdTraceSearchStatus } from '@/api/generated/models/getCompaniesCompanyIdTraceSearchStatus';
import { useSearchTraceQuery } from '@/api/endpoints/traceApi';
import { ApiErrorAlert } from '@/components/ApiErrorAlert';
import { DecimalDisplay } from '@/components/DecimalDisplay';
import { LineageLink } from '@/components/LineageLink';
import { PaginatedTable } from '@/components/PaginatedTable';
import { PermissionGate } from '@/components/PermissionGate';
import { RequestLineCancelledBadge } from '@/components/RequestLineCancelledBadge';
import { useAppSelector } from '@/hooks/useAppSelector';
import { getPipelineStatusLabel } from '@/lib/traceLabels';
import { PageShell } from '@/layouts/pageShell/PageShell';

dayjs.extend(relativeTime);

const PAGE_SIZE = 20;

type StatusFilter = keyof typeof GetCompaniesCompanyIdTraceSearchStatus | 'ALL';

export function TraceSearchPage() {
  const { t } = useTranslation('trace');
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const companyId = useAppSelector((state) => state.auth.activeCompanyId);

  const [query, setQuery] = useState(searchParams.get('q') ?? '');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>(() => {
    const status = searchParams.get('status');
    if (
      status &&
      Object.values(GetCompaniesCompanyIdTraceSearchStatus).includes(
        status as keyof typeof GetCompaniesCompanyIdTraceSearchStatus,
      )
    ) {
      return status as keyof typeof GetCompaniesCompanyIdTraceSearchStatus;
    }
    return 'ALL';
  });
  const [requestIdFilter, setRequestIdFilter] = useState(
    searchParams.get('requestId') ?? '',
  );
  const [pagination, setPagination] = useState<MRT_PaginationState>({
    pageIndex: 0,
    pageSize: PAGE_SIZE,
  });

  useEffect(() => {
    setQuery(searchParams.get('q') ?? '');
    const status = searchParams.get('status');
    if (
      status &&
      Object.values(GetCompaniesCompanyIdTraceSearchStatus).includes(
        status as keyof typeof GetCompaniesCompanyIdTraceSearchStatus,
      )
    ) {
      setStatusFilter(
        status as keyof typeof GetCompaniesCompanyIdTraceSearchStatus,
      );
    } else {
      setStatusFilter('ALL');
    }
    setRequestIdFilter(searchParams.get('requestId') ?? '');
    setPagination((current) => ({ ...current, pageIndex: 0 }));
  }, [searchParams]);

  const searchQuery = useSearchTraceQuery(
    {
      companyId: companyId ?? '',
      limit: pagination.pageSize,
      offset: pagination.pageIndex * pagination.pageSize,
      ...(query.trim() ? { q: query.trim() } : {}),
      ...(requestIdFilter.trim() ? { requestId: requestIdFilter.trim() } : {}),
      ...(statusFilter !== 'ALL' ? { status: statusFilter } : {}),
    },
    { skip: !companyId },
  );

  const columns = useMemo<MRT_ColumnDef<TraceSearchItem>[]>(
    () => [
      {
        accessorKey: 'lineageId',
        header: t('columns.lineageId'),
        Cell: ({ row }) => <LineageLink lineageId={row.original.lineageId} />,
      },
      {
        accessorKey: 'description',
        header: t('columns.description'),
        Cell: ({ row }) => (
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            flexWrap="wrap"
          >
            <span>{row.original.description}</span>
            <RequestLineCancelledBadge cancelledAt={row.original.cancelledAt} />
          </Stack>
        ),
      },
      {
        id: 'quantity',
        header: t('columns.quantity'),
        Cell: ({ row }) => (
          <>
            <DecimalDisplay value={row.original.quantity} component="span" />
            {row.original.unit ? ` ${row.original.unit}` : ''}
          </>
        ),
      },
      {
        accessorKey: 'requestTitle',
        header: t('columns.request'),
        Cell: ({ cell }) => cell.getValue<string | null>() ?? '—',
      },
      {
        accessorKey: 'pipelineStatus',
        header: t('columns.pipelineStatus'),
        Cell: ({ row }) => (
          <Chip
            label={getPipelineStatusLabel(row.original.pipelineStatus, t)}
            size="small"
            variant="outlined"
          />
        ),
      },
      {
        accessorKey: 'updatedAt',
        header: t('columns.updatedAt'),
        Cell: ({ cell }) => dayjs(cell.getValue<string>()).fromNow(),
      },
    ],
    [t],
  );

  function applyFilters() {
    const nextParams = new URLSearchParams();
    if (query.trim()) {
      nextParams.set('q', query.trim());
    }
    if (statusFilter !== 'ALL') {
      nextParams.set('status', statusFilter);
    }
    if (requestIdFilter.trim()) {
      nextParams.set('requestId', requestIdFilter.trim());
    }
    setSearchParams(nextParams);
  }

  if (!companyId) {
    return null;
  }

  const items = searchQuery.data?.items ?? [];
  const rowCount = searchQuery.data?.pagination.total ?? 0;

  return (
    <PageShell maxWidth="xl">
      <PermissionGate permission="viewTrace">
        <Stack spacing={3}>
          <Box>
            <Typography variant="h5" component="h1">
              {t('title')}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t('subtitle')}
            </Typography>
          </Box>

          <Stack
            direction={{ xs: 'column', md: 'row' }}
            spacing={2}
            alignItems={{ md: 'flex-end' }}
          >
            <TextField
              label={t('search.placeholder')}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  applyFilters();
                }
              }}
              fullWidth
            />
            <FormControl sx={{ minWidth: 180 }}>
              <InputLabel id="trace-status-filter">
                {t('search.statusFilter')}
              </InputLabel>
              <Select
                labelId="trace-status-filter"
                label={t('search.statusFilter')}
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(event.target.value as StatusFilter)
                }
              >
                <MenuItem value="ALL">{t('search.statusAll')}</MenuItem>
                {Object.values(GetCompaniesCompanyIdTraceSearchStatus).map(
                  (status) => (
                    <MenuItem key={status} value={status}>
                      {getPipelineStatusLabel(status, t)}
                    </MenuItem>
                  ),
                )}
              </Select>
            </FormControl>
            <TextField
              label={t('search.requestFilter')}
              value={requestIdFilter}
              onChange={(event) => setRequestIdFilter(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  applyFilters();
                }
              }}
              sx={{ minWidth: 280 }}
            />
            <Button variant="contained" onClick={applyFilters}>
              {t('search.apply')}
            </Button>
          </Stack>

          <ApiErrorAlert error={searchQuery.error} />

          {items.length === 0 && !searchQuery.isLoading ? (
            <Typography color="text.secondary">{t('search.empty')}</Typography>
          ) : (
            <PaginatedTable
              columns={columns}
              data={items}
              rowCount={rowCount}
              pagination={pagination}
              onPaginationChange={setPagination}
              isLoading={searchQuery.isLoading}
              isFetching={searchQuery.isFetching}
              onRowClick={(row) => navigate(`/app/trace/${row.lineageId}`)}
              getRowId={(row) => row.lineageId}
            />
          )}
        </Stack>
      </PermissionGate>
    </PageShell>
  );
}
