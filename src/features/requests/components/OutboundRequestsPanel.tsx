import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type {
  MRT_ColumnDef,
  MRT_ColumnFiltersState,
  MRT_PaginationState,
} from 'material-react-table';
import { useTranslation } from 'react-i18next';

import type { MaterialRequestSummary } from '@/api/generated/models/materialRequestSummary';
import { useListRequestsQuery } from '@/api/endpoints/requestsApi';
import { ApiErrorAlert } from '@/components/ApiErrorAlert';
import { PaginatedTable } from '@/components/PaginatedTable';
import { StatusBadge } from '@/components/StatusBadge';
import type { MaterialRequestStatus } from '@/types/api';

const PAGE_SIZE = 20;

const STATUS_OPTIONS: Array<MaterialRequestStatus | ''> = [
  '',
  'DRAFT',
  'QUOTING',
  'PARTIALLY_ORDERED',
  'ORDERED',
  'CLOSED',
];

function getStatusFilterValue(
  columnFilters: MRT_ColumnFiltersState,
): MaterialRequestStatus | '' {
  const statusFilter = columnFilters.find((filter) => filter.id === 'status');
  const value = statusFilter?.value;

  if (value === undefined || value === '' || value === 'ALL') {
    return '';
  }

  return value as MaterialRequestStatus;
}

interface OutboundRequestsPanelProps {
  companyId: string;
}

export function OutboundRequestsPanel({
  companyId,
}: OutboundRequestsPanelProps) {
  const { t } = useTranslation(['requests', 'enums']);
  const navigate = useNavigate();

  const [pagination, setPagination] = useState<MRT_PaginationState>({
    pageIndex: 0,
    pageSize: PAGE_SIZE,
  });
  const [columnFilters, setColumnFilters] = useState<MRT_ColumnFiltersState>([
    { id: 'status', value: '' },
  ]);

  const statusFilter = getStatusFilterValue(columnFilters);

  const listQuery = useListRequestsQuery(
    {
      companyId,
      limit: pagination.pageSize,
      offset: pagination.pageIndex * pagination.pageSize,
      ...(statusFilter ? { status: statusFilter } : {}),
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

  const columns = useMemo<MRT_ColumnDef<MaterialRequestSummary>[]>(
    () => [
      {
        accessorKey: 'title',
        header: t('columns.title'),
        enableColumnFilter: false,
        Cell: ({ cell }) => cell.getValue<string>() || '—',
      },
      {
        id: 'createdBy',
        header: t('columns.createdBy'),
        enableColumnFilter: false,
        Cell: ({ row }) => row.original.createdByUserName ?? '—',
      },
      {
        accessorKey: 'priority',
        header: t('columns.priority'),
        enableColumnFilter: false,
        Cell: ({ cell }) =>
          t(
            `enums:materialRequestPriority.${cell.getValue<string>().toLowerCase()}`,
          ),
      },
      {
        accessorKey: 'dueDate',
        header: t('columns.dueDate'),
        enableColumnFilter: false,
        Cell: ({ cell }) => {
          const value = cell.getValue<string | null>();
          return value ? new Date(value).toLocaleDateString() : '—';
        },
      },
      {
        accessorKey: 'status',
        header: t('columns.status'),
        muiTableHeadCellProps: {
          sx: { maxWidth: 200 },
        },
        muiTableCellProps: {
          sx: { maxWidth: 200 },
        },
        muiFilterTextFieldProps: {
          sx: { maxWidth: 240 },
        },
        enableColumnFilter: true,
        filterVariant: 'select',
        filterSelectOptions: statusFilterOptions,
        Cell: ({ cell }) => (
          <StatusBadge status={cell.getValue<MaterialRequestStatus>()} />
        ),
      },
      {
        accessorKey: 'createdAt',
        header: t('columns.createdAt'),
        enableColumnFilter: false,
        Cell: ({ cell }) => new Date(cell.getValue<string>()).toLocaleString(),
      },
    ],
    [statusFilterOptions, t],
  );

  const requests = listQuery.data?.requests ?? [];
  const total = listQuery.data?.pagination.total ?? 0;

  return (
    <>
      <ApiErrorAlert error={listQuery.error} />

      <PaginatedTable
        columns={columns}
        data={requests}
        rowCount={total}
        pagination={pagination}
        onPaginationChange={setPagination}
        isLoading={listQuery.isLoading}
        isFetching={listQuery.isFetching}
        onRowClick={(row) => navigate(`/app/requests/${row.id}`)}
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
      />
    </>
  );
}
