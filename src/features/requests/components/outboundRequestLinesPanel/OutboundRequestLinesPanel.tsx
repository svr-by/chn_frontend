import { memo, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import type { MRT_ColumnDef, MRT_PaginationState } from 'material-react-table';
import { useTranslation } from 'react-i18next';

import type { RequestLineListItem } from '@/api/generated/models/requestLineListItem';
import { useListRequestLinesQuery } from '@/api/endpoints/requestsApi';
import { ApiErrorAlert } from '@/components/feedback/apiErrorAlert/ApiErrorAlert';
import { PaginatedTable } from '@/components/tables/paginatedTable/PaginatedTable';
import { RequestLinePipelineIcons } from '@/features/requests/components/outboundRequestLinesPanel/RequestLinePipelineIcons';
import { createRequestLineListBaseColumns } from '@/features/requests/lib/requestLineListTableColumns';
import { formatLocalizedDate } from '@/lib/dateFormat';
import {
  buildOutboundRequestLinesQueryArgs,
  type RequestLinesFiltersValue,
} from '@/features/requests/lib/requestLinesFilters';

const PAGE_SIZE = 20;

interface OutboundRequestLinesPanelProps {
  companyId: string;
  filters: RequestLinesFiltersValue;
}

export const OutboundRequestLinesPanel = memo(function OutboundRequestLinesPanel({
  companyId,
  filters,
}: OutboundRequestLinesPanelProps) {
  const { t, i18n } = useTranslation('requests');

  const [pagination, setPagination] = useState<MRT_PaginationState>({
    pageIndex: 0,
    pageSize: PAGE_SIZE,
  });

  useEffect(() => {
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  }, [filters]);

  const listParams = useMemo(
    () =>
      buildOutboundRequestLinesQueryArgs({
        companyId,
        limit: pagination.pageSize,
        offset: pagination.pageIndex * pagination.pageSize,
        filters,
      }),
    [companyId, filters, pagination.pageIndex, pagination.pageSize],
  );

  const listQuery = useListRequestLinesQuery(listParams, { skip: !companyId });

  const columns = useMemo<MRT_ColumnDef<RequestLineListItem>[]>(
    () => [
      ...createRequestLineListBaseColumns<RequestLineListItem>(t),
      {
        id: 'request',
        accessorFn: (row) => row.request.status,
        header: t('requestLines.columns.request'),
        size: 180,
        grow: false,
        muiTableBodyCellProps: {
          align: 'center',
        },
        muiTableHeadCellProps: {
          align: 'center',
        },
        Cell: ({ row }) => (
          <Link to={`/app/requests/${row.original.request.id}`}>
            {row.original.request.title ??
              t('requestLines.fallbackRequest', {
                id: row.original.request.id.slice(0, 8),
              })}
          </Link>
        ),
      },
      {
        id: 'createdBy',
        accessorFn: (row) => row.request.createdBy?.id ?? '',
        header: t('requestLines.columns.createdBy'),
        size: 140,
        grow: false,
        Cell: ({ row }) => row.original.request.createdBy?.name ?? '—',
      },
      {
        id: 'pipeline',
        header: t('requestLines.columns.pipeline'),
        size: 160,
        grow: false,
        Cell: ({ row }) => (
          <RequestLinePipelineIcons links={row.original.links} />
        ),
      },
      {
        accessorKey: 'createdAt',
        header: t('requestLines.columns.createdAt'),
        size: 120,
        grow: false,
        Cell: ({ cell }) => formatLocalizedDate(cell.getValue<string | null>(), i18n.language),
      },
      {
        accessorKey: 'updatedAt',
        header: t('requestLines.columns.updatedAt'),
        size: 120,
        grow: false,
        Cell: ({ cell }) => formatLocalizedDate(cell.getValue<string | null>(), i18n.language),
      },
    ],
    [t, i18n.language],
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
        getRowId={(row) => row.id}
        layoutMode="grid"
        enableColumnFilters={false}
        enableFullScreenToggle
      />
    </>
  );
});
