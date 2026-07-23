import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Chip, Stack, Typography } from '@mui/material';
import type {
  MRT_ColumnDef,
  MRT_ColumnFiltersState,
  MRT_PaginationState,
} from 'material-react-table';
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
import type { MaterialRequestStatus } from '@/types/api';

const PAGE_SIZE = 20;

type InboundRequestLinesStatusFilter = InboundRequestLineStatusFilter | '';

type HasQuoteFilterValue = 'withoutQuotes';

const STATUS_OPTIONS: InboundRequestLinesStatusFilter[] = [
  '',
  ...Object.values(GetCompaniesCompanyIdRequestLinesInboundStatus),
];

function getImportSku(line: InboundRequestLineListItem) {
  const value = line.attributes?.importSku;
  return typeof value === 'string' && value.trim() ? value : null;
}

function getRequestStatusFilter(
  columnFilters: MRT_ColumnFiltersState,
): InboundRequestLinesStatusFilter {
  const value = columnFilters.find((filter) => filter.id === 'request')?.value;

  if (value === undefined || value === '' || value === 'ALL') {
    return '';
  }

  return value as InboundRequestLineStatusFilter;
}

function getWithoutQuotesFilter(
  columnFilters: MRT_ColumnFiltersState,
): boolean {
  const value = columnFilters.find((filter) => filter.id === 'hasQuote')?.value;
  const values = Array.isArray(value) ? value : value ? [value] : [];

  return values.includes('withoutQuotes');
}

interface InboundRequestLinesPanelProps {
  companyId: string;
}

export function InboundRequestLinesPanel({
  companyId,
}: InboundRequestLinesPanelProps) {
  const { t } = useTranslation('requests');
  const navigate = useNavigate();

  const [pagination, setPagination] = useState<MRT_PaginationState>({
    pageIndex: 0,
    pageSize: PAGE_SIZE,
  });
  const [columnFilters, setColumnFilters] = useState<MRT_ColumnFiltersState>([
    { id: 'request', value: '' },
    { id: 'hasQuote', value: [] },
  ]);
  const [globalFilter, setGlobalFilter] = useState('');

  const searchQuery = (globalFilter ?? '').trim();
  const statusFilter = getRequestStatusFilter(columnFilters);
  const withoutQuotes = getWithoutQuotesFilter(columnFilters);

  const listParams = useMemo<GetCompaniesCompanyIdRequestLinesInboundParams>(
    () => ({
      limit: pagination.pageSize,
      offset: pagination.pageIndex * pagination.pageSize,
      sortBy: 'requestCreatedAt',
      sortOrder: 'desc',
      ...(searchQuery ? { q: searchQuery } : {}),
      ...(statusFilter ? { status: statusFilter } : {}),
      ...(withoutQuotes ? { withoutQuotes: 'true' } : {}),
    }),
    [
      pagination.pageIndex,
      pagination.pageSize,
      searchQuery,
      statusFilter,
      withoutQuotes,
    ],
  );

  const listQuery = useListInboundRequestLinesQuery(
    {
      companyId,
      ...listParams,
    },
    { skip: !companyId },
  );

  const statusFilterOptions = useMemo(
    () =>
      STATUS_OPTIONS.map((status) => ({
        label:
          status === ''
            ? t('statusFilter.all')
            : t(`statusFilter.${status.toLowerCase()}`, {
                defaultValue: status,
              }),
        value: status,
      })),
    [t],
  );

  const hasQuoteFilterOptions = useMemo(
    () => [
      {
        label: t('requestLines.inbound.filters.withoutQuotes'),
        value: 'withoutQuotes' satisfies HasQuoteFilterValue,
      },
    ],
    [t],
  );

  const columns = useMemo<MRT_ColumnDef<InboundRequestLineListItem>[]>(
    () => [
      {
        accessorKey: 'description',
        header: t('requestLines.columns.description'),
        size: 300,
        minSize: 200,
        enableColumnFilter: false,
        Cell: ({ row }) => (
          <Stack spacing={0.5}>
            <Typography variant="body2">{row.original.description}</Typography>
            {(row.original.product?.sku ?? getImportSku(row.original)) ? (
              <Typography variant="caption" color="text.secondary">
                {row.original.product?.sku ?? getImportSku(row.original)}
              </Typography>
            ) : null}
          </Stack>
        ),
      },
      {
        id: 'quantity',
        header: t('requestLines.columns.quantity'),
        size: 50,
        maxSize: 50,
        enableColumnFilter: false,
        Cell: ({ row }) => (
          <>
            <DecimalDisplay value={row.original.quantity} component="span" />
            {row.original.unit ? ` ${row.original.unit}` : ''}
          </>
        ),
      },
      {
        id: 'request',
        accessorFn: (row) => row.request.status,
        header: t('requestLines.columns.request'),
        enableColumnFilter: true,
        filterVariant: 'select',
        filterSelectOptions: statusFilterOptions,
        muiTableHeadCellProps: {
          sx: { maxWidth: 200 },
        },
        muiTableBodyCellProps: {
          sx: { maxWidth: 200 },
        },
        muiFilterTextFieldProps: {
          sx: { maxWidth: 240 },
        },
        Cell: ({ row }) => (
          <Stack spacing={0.5} alignItems="center">
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
        id: 'buyer',
        accessorFn: (row) => row.buyerCompany.name,
        header: t('inbound.columns.buyer'),
        enableColumnFilter: false,
        Cell: ({ row }) => row.original.buyerCompany.name,
      },
      {
        id: 'hasQuote',
        accessorFn: (row) => row.links.hasQuote,
        header: t('requestLines.inbound.columns.hasQuote'),
        enableColumnFilter: true,
        filterVariant: 'multi-select',
        filterSelectOptions: hasQuoteFilterOptions,
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
      {
        accessorKey: 'distributedAt',
        header: t('inbound.columns.distributedAt'),
        enableColumnFilter: false,
        Cell: ({ cell }) => {
          const value = cell.getValue<string | null>();
          return value ? new Date(value).toLocaleString() : '—';
        },
      },
      {
        accessorKey: 'createdAt',
        header: t('requestLines.columns.createdAt'),
        enableColumnFilter: false,
        Cell: ({ cell }) => new Date(cell.getValue<string>()).toLocaleString(),
      },
      {
        accessorKey: 'updatedAt',
        header: t('requestLines.columns.updatedAt'),
        enableColumnFilter: false,
        Cell: ({ cell }) => new Date(cell.getValue<string>()).toLocaleString(),
      },
    ],
    [hasQuoteFilterOptions, statusFilterOptions, t],
  );

  const items = listQuery.data?.items ?? [];
  const total = listQuery.data?.pagination.total ?? 0;

  return (
    <>
      <ApiErrorAlert error={listQuery.error} />

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
        enableColumnFilters
        manualFiltering
        columnFilters={columnFilters}
        onColumnFiltersChange={(updater) => {
          setColumnFilters(updater);
          setPagination((prev) => ({ ...prev, pageIndex: 0 }));
        }}
        columnFilterDisplayMode="subheader"
        enableFullScreenToggle
        enableGlobalFilter
        globalFilter={globalFilter}
        onGlobalFilterChange={(updater) => {
          setGlobalFilter((prev) => {
            const next =
              typeof updater === 'function' ? updater(prev) : updater;
            return next ?? '';
          });
          setPagination((prev) => ({ ...prev, pageIndex: 0 }));
        }}
        muiSearchTextFieldProps={{
          placeholder: t('requestLines.filters.q'),
          sx: { minWidth: 240 },
        }}
      />
    </>
  );
}
