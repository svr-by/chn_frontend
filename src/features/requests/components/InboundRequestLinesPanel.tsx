import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button, Chip, Stack, Typography } from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';
import type { MRT_ColumnDef, MRT_PaginationState } from 'material-react-table';
import { useTranslation } from 'react-i18next';

import type { InboundRequestLineListItem } from '@/api/generated/models/inboundRequestLineListItem';
import { GetCompaniesCompanyIdRequestLinesInboundStatus } from '@/api/generated/models/getCompaniesCompanyIdRequestLinesInboundStatus';
import type { GetCompaniesCompanyIdRequestLinesInboundParams } from '@/api/generated/models/getCompaniesCompanyIdRequestLinesInboundParams';
import type { GetCompaniesCompanyIdRequestLinesInboundStatus as InboundRequestLineStatusFilter } from '@/api/generated/models/getCompaniesCompanyIdRequestLinesInboundStatus';
import { useListInboundRequestLinesQuery } from '@/api/endpoints/requestsApi';
import { ApiErrorAlert } from '@/components/ApiErrorAlert';
import { DecimalDisplay } from '@/components/DecimalDisplay';
import { PaginatedTable } from '@/components/PaginatedTable';
import { StatusBadge } from '@/components/StatusBadge';
import {
  EMPTY_INBOUND_REQUEST_LINES_FILTERS,
  InboundRequestLinesFiltersDrawer,
  type InboundRequestLinesFilterState,
  type InboundRequestLinesStatusFilter,
} from '@/features/requests/components/InboundRequestLinesFiltersDrawer';
import type { MaterialRequestStatus } from '@/types/api';

const PAGE_SIZE = 20;

function parseStatus(value: string | null): InboundRequestLinesStatusFilter {
  if (
    value &&
    Object.values(GetCompaniesCompanyIdRequestLinesInboundStatus).includes(
      value as InboundRequestLineStatusFilter,
    )
  ) {
    return value as InboundRequestLineStatusFilter;
  }

  return 'ALL';
}

function filtersFromSearchParams(
  searchParams: URLSearchParams,
): InboundRequestLinesFilterState {
  return {
    q: searchParams.get('q') ?? '',
    status: parseStatus(searchParams.get('status')),
    requestId: searchParams.get('requestId') ?? '',
    withoutQuotes: searchParams.get('withoutQuotes') === 'true',
  };
}

function filtersToSearchParams(filters: InboundRequestLinesFilterState) {
  const params = new URLSearchParams();

  if (filters.q.trim()) {
    params.set('q', filters.q.trim());
  }
  if (filters.status !== 'ALL') {
    params.set('status', filters.status);
  }
  if (filters.requestId.trim()) {
    params.set('requestId', filters.requestId.trim());
  }
  if (filters.withoutQuotes) {
    params.set('withoutQuotes', 'true');
  }

  return params;
}

interface InboundRequestLinesPanelProps {
  companyId: string;
}

export function InboundRequestLinesPanel({ companyId }: InboundRequestLinesPanelProps) {
  const { t } = useTranslation('requests');
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const activeFilters = useMemo(
    () => filtersFromSearchParams(searchParams),
    [searchParams],
  );
  const [draftFilters, setDraftFilters] =
    useState<InboundRequestLinesFilterState>(activeFilters);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [pagination, setPagination] = useState<MRT_PaginationState>({
    pageIndex: 0,
    pageSize: PAGE_SIZE,
  });

  useEffect(() => {
    setDraftFilters(activeFilters);
    setPagination((current) => ({ ...current, pageIndex: 0 }));
  }, [activeFilters]);

  const listParams = useMemo<GetCompaniesCompanyIdRequestLinesInboundParams>(
    () => ({
      limit: pagination.pageSize,
      offset: pagination.pageIndex * pagination.pageSize,
      sortBy: 'requestCreatedAt',
      sortOrder: 'desc',
      ...(activeFilters.q.trim() ? { q: activeFilters.q.trim() } : {}),
      ...(activeFilters.status !== 'ALL' ? { status: activeFilters.status } : {}),
      ...(activeFilters.requestId.trim()
        ? { requestId: activeFilters.requestId.trim() }
        : {}),
      ...(activeFilters.withoutQuotes ? { withoutQuotes: 'true' } : {}),
    }),
    [activeFilters, pagination.pageIndex, pagination.pageSize],
  );

  const listQuery = useListInboundRequestLinesQuery(
    {
      companyId,
      ...listParams,
    },
    { skip: !companyId },
  );

  const columns = useMemo<MRT_ColumnDef<InboundRequestLineListItem>[]>(
    () => [
      {
        id: 'buyer',
        header: t('inbound.columns.buyer'),
        Cell: ({ row }) => row.original.buyerCompany.name,
      },
      {
        id: 'request',
        header: t('requestLines.columns.request'),
        Cell: ({ row }) => (
          <Stack spacing={0.5}>
            <Typography variant="body2">
              {row.original.request.title ??
                t('requestLines.fallbackRequest', {
                  id: row.original.request.id.slice(0, 8),
                })}
            </Typography>
            <StatusBadge
              status={row.original.request.status as MaterialRequestStatus}
            />
          </Stack>
        ),
      },
      {
        accessorKey: 'lineNumber',
        header: t('requestLines.columns.lineNumber'),
      },
      {
        accessorKey: 'description',
        header: t('requestLines.columns.description'),
      },
      {
        id: 'quantity',
        header: t('requestLines.columns.quantity'),
        Cell: ({ row }) => (
          <>
            <DecimalDisplay value={row.original.quantity} component="span" />
            {row.original.unit ? ` ${row.original.unit}` : ''}
          </>
        ),
      },
      {
        accessorKey: 'distributedAt',
        header: t('inbound.columns.distributedAt'),
        Cell: ({ cell }) => {
          const value = cell.getValue<string | null>();
          return value ? new Date(value).toLocaleString() : '—';
        },
      },
      {
        id: 'hasQuote',
        header: t('requestLines.inbound.columns.hasQuote'),
        Cell: ({ row }) =>
          row.original.links.hasQuote ? (
            <Chip
              label={t('requestLines.inbound.hasQuote')}
              size="small"
              color="success"
              variant="outlined"
            />
          ) : (
            <Chip
              label={t('requestLines.inbound.noQuote')}
              size="small"
              variant="outlined"
            />
          ),
      },
    ],
    [t],
  );

  const items = listQuery.data?.items ?? [];
  const total = listQuery.data?.pagination.total ?? 0;
  const activeFilterCount = Array.from(filtersToSearchParams(activeFilters)).length;

  function applyFilters() {
    setSearchParams(filtersToSearchParams(draftFilters));
    setFiltersOpen(false);
  }

  function resetFilters() {
    setDraftFilters(EMPTY_INBOUND_REQUEST_LINES_FILTERS);
    setSearchParams({});
    setFiltersOpen(false);
  }

  return (
    <>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="flex-end"
        alignItems={{ xs: 'stretch', sm: 'center' }}
        spacing={2}
        sx={{ mb: 2 }}
      >
        <Button
          variant="outlined"
          startIcon={<FilterListIcon />}
          onClick={() => setFiltersOpen(true)}
        >
          {activeFilterCount
            ? t('requestLines.filters.openWithCount', {
                count: activeFilterCount,
              })
            : t('requestLines.filters.open')}
        </Button>
      </Stack>

      <ApiErrorAlert error={listQuery.error} />

      {!listQuery.isLoading && items.length === 0 ? (
        <Typography color="text.secondary">
          {t('requestLines.inbound.empty')}
        </Typography>
      ) : (
        <PaginatedTable
          columns={columns}
          data={items}
          rowCount={total}
          pagination={pagination}
          onPaginationChange={setPagination}
          isLoading={listQuery.isLoading}
          isFetching={listQuery.isFetching}
          onRowClick={(row) =>
            navigate(`/app/requests/inbound/${row.request.id}`)
          }
          getRowId={(row) => row.id}
        />
      )}

      <InboundRequestLinesFiltersDrawer
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        value={draftFilters}
        onChange={setDraftFilters}
        onApply={applyFilters}
        onReset={resetFilters}
      />
    </>
  );
}
