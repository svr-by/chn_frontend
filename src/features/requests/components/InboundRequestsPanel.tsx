import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type {
  MRT_ColumnDef,
  MRT_ColumnFiltersState,
  MRT_PaginationState,
} from 'material-react-table';
import { useTranslation } from 'react-i18next';

import type { InboundMaterialRequestSummary } from '@/api/generated/models/inboundMaterialRequestSummary';
import { useListInboundRequestsQuery } from '@/api/endpoints/requestsApi';
import { ApiErrorAlert } from '@/components/ApiErrorAlert';
import { PaginatedTable } from '@/components/PaginatedTable';
import { StatusBadge } from '@/components/StatusBadge';
import type { MaterialRequestStatus } from '@/types/api';

const PAGE_SIZE = 20;

const STATUS_OPTIONS: Array<MaterialRequestStatus | ''> = [
  '',
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

interface InboundRequestsPanelProps {
  companyId: string;
}

export function InboundRequestsPanel({ companyId }: InboundRequestsPanelProps) {
  const { t } = useTranslation('requests');
  const navigate = useNavigate();

  const [pagination, setPagination] = useState<MRT_PaginationState>({
    pageIndex: 0,
    pageSize: PAGE_SIZE,
  });
  const [columnFilters, setColumnFilters] = useState<MRT_ColumnFiltersState>([
    { id: 'status', value: '' },
  ]);

  const statusFilter = getStatusFilterValue(columnFilters);

  const listQuery = useListInboundRequestsQuery(
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

  const columns = useMemo<MRT_ColumnDef<InboundMaterialRequestSummary>[]>(
    () => [
      {
        id: 'buyer',
        header: t('inbound.columns.buyer'),
        enableColumnFilter: false,
        Cell: ({ row }) => row.original.buyerCompany.name,
      },
      {
        accessorKey: 'title',
        header: t('columns.title'),
        enableColumnFilter: false,
        Cell: ({ cell }) => cell.getValue<string | null>() ?? '—',
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
        accessorKey: 'lineCount',
        header: t('inbound.columns.lineCount'),
        enableColumnFilter: false,
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
        onRowClick={(row) => navigate(`/app/requests/inbound/${row.id}`)}
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
