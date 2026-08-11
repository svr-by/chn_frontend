import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Stack, Typography } from '@mui/material';
import type {
  MRT_ColumnDef,
  MRT_ColumnFiltersState,
  MRT_PaginationState,
} from 'material-react-table';
import { useTranslation } from 'react-i18next';

import type { RequestLineListItem } from '@/api/generated/models/requestLineListItem';
import { GetCompaniesCompanyIdRequestLinesStatus } from '@/api/generated/models/getCompaniesCompanyIdRequestLinesStatus';
import type { GetCompaniesCompanyIdRequestLinesParams } from '@/api/generated/models/getCompaniesCompanyIdRequestLinesParams';
import type { GetCompaniesCompanyIdRequestLinesStatus as RequestLineStatusFilter } from '@/api/generated/models/getCompaniesCompanyIdRequestLinesStatus';
import { useListMembersQuery } from '@/api/endpoints/membersApi';
import { useListRequestLinesQuery } from '@/api/endpoints/requestsApi';
import { ApiErrorAlert } from '@/components/ApiErrorAlert';
import { DecimalDisplay } from '@/components/DecimalDisplay';
import { PaginatedTable } from '@/components/PaginatedTable';
import { RequestLinePipelineIcons } from '@/features/requests/components/outboundRequestLinesPanel/RequestLinePipelineIcons';
import { StatusBadge } from '@/components/StatusBadge';
import type { MaterialRequestStatus } from '@/types/api';

const PAGE_SIZE = 20;

type RequestLinesStatusFilter = RequestLineStatusFilter | '';

type PipelineFilterValue = 'undistributed' | 'withoutQuotes';

const STATUS_OPTIONS: RequestLinesStatusFilter[] = [
  '',
  ...Object.values(GetCompaniesCompanyIdRequestLinesStatus),
];

function getImportSku(line: RequestLineListItem) {
  const value = line.attributes?.importSku;
  return typeof value === 'string' && value.trim() ? value : null;
}

function getRequestStatusFilter(
  columnFilters: MRT_ColumnFiltersState,
): RequestLinesStatusFilter {
  const value = columnFilters.find((filter) => filter.id === 'request')?.value;

  if (value === undefined || value === '' || value === 'ALL') {
    return '';
  }

  return value as RequestLineStatusFilter;
}

function getCreatedByFilter(columnFilters: MRT_ColumnFiltersState): string {
  const value = columnFilters.find(
    (filter) => filter.id === 'createdBy',
  )?.value;
  return typeof value === 'string' ? value.trim() : '';
}

function getPipelineFilters(columnFilters: MRT_ColumnFiltersState) {
  const value = columnFilters.find((filter) => filter.id === 'pipeline')?.value;
  const values = Array.isArray(value) ? value : value ? [value] : [];

  return {
    undistributed: values.includes('undistributed'),
    withoutQuotes: values.includes('withoutQuotes'),
  };
}

interface OutboundRequestLinesPanelProps {
  companyId: string;
}

export function OutboundRequestLinesPanel({
  companyId,
}: OutboundRequestLinesPanelProps) {
  const { t } = useTranslation(['requests', 'trace']);
  const navigate = useNavigate();

  const [pagination, setPagination] = useState<MRT_PaginationState>({
    pageIndex: 0,
    pageSize: PAGE_SIZE,
  });
  const [columnFilters, setColumnFilters] = useState<MRT_ColumnFiltersState>([
    { id: 'request', value: '' },
    { id: 'createdBy', value: '' },
    { id: 'pipeline', value: [] },
  ]);
  const [globalFilter, setGlobalFilter] = useState('');

  const searchQuery = (globalFilter ?? '').trim();
  const statusFilter = getRequestStatusFilter(columnFilters);
  const createdByUserId = getCreatedByFilter(columnFilters);
  const { undistributed, withoutQuotes } = getPipelineFilters(columnFilters);

  const membersQuery = useListMembersQuery({ companyId }, { skip: !companyId });

  const listParams = useMemo<GetCompaniesCompanyIdRequestLinesParams>(
    () => ({
      limit: pagination.pageSize,
      offset: pagination.pageIndex * pagination.pageSize,
      sortBy: 'requestCreatedAt',
      sortOrder: 'desc',
      ...(searchQuery ? { q: searchQuery } : {}),
      ...(statusFilter ? { status: statusFilter } : {}),
      ...(createdByUserId ? { createdByUserId } : {}),
      ...(undistributed ? { undistributed: 'true' } : {}),
      ...(withoutQuotes ? { withoutQuotes: 'true' } : {}),
    }),
    [
      createdByUserId,
      pagination.pageIndex,
      pagination.pageSize,
      searchQuery,
      statusFilter,
      undistributed,
      withoutQuotes,
    ],
  );

  const listQuery = useListRequestLinesQuery(
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

  const createdByFilterOptions = useMemo(() => {
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

  const pipelineFilterOptions = useMemo(
    () => [
      {
        label: t('requestLines.filters.undistributed'),
        value: 'undistributed' satisfies PipelineFilterValue,
      },
      {
        label: t('requestLines.filters.withoutQuotes'),
        value: 'withoutQuotes' satisfies PipelineFilterValue,
      },
    ],
    [t],
  );

  const columns = useMemo<MRT_ColumnDef<RequestLineListItem>[]>(
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
        muiTableCellProps: {
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
        id: 'createdBy',
        accessorFn: (row) => row.request.createdByUserId ?? '',
        header: t('requestLines.columns.createdBy'),
        enableColumnFilter: true,
        filterVariant: 'select',
        filterSelectOptions: createdByFilterOptions,
        Cell: ({ row }) => row.original.request.createdByUserName ?? '—',
      },
      {
        id: 'pipeline',
        header: t('requestLines.columns.pipeline'),
        enableColumnFilter: true,
        filterVariant: 'multi-select',
        filterSelectOptions: pipelineFilterOptions,
        Cell: ({ row }) => (
          <RequestLinePipelineIcons links={row.original.links} />
        ),
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
    [createdByFilterOptions, pipelineFilterOptions, statusFilterOptions, t],
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
        onRowClick={(row) => navigate(`/app/requests/${row.request.id}`)}
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
