import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import type { MRT_ColumnDef, MRT_PaginationState } from 'material-react-table';
import { useTranslation } from 'react-i18next';

import type { RequestLineListItem } from '@/api/generated/models/requestLineListItem';
import { useListRequestLinesQuery } from '@/api/endpoints/requestsApi';
import { ApiErrorAlert } from '@/components/ApiErrorAlert';
import { PaginatedTable } from '@/components/PaginatedTable';
import { RequestLinePipelineIcons } from '@/features/requests/components/outboundRequestLinesPanel/RequestLinePipelineIcons';
import { createRequestLineListBaseColumns } from '@/features/requests/lib/requestLineListTableColumns';
import {
  buildOutboundRequestLinesQueryArgs,
  type RequestLinesFiltersValue,
} from '@/features/requests/lib/requestLinesFilters';

const PAGE_SIZE = 20;

interface OutboundRequestLinesPanelProps {
  companyId: string;
  filters: RequestLinesFiltersValue;
}

export function OutboundRequestLinesPanel({
  companyId,
  filters,
}: OutboundRequestLinesPanelProps) {
  const { t } = useTranslation('requests');

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
        accessorFn: (row) => row.request.createdByUserId ?? '',
        header: t('requestLines.columns.createdBy'),
        size: 140,
        grow: false,
        Cell: ({ row }) => row.original.request.createdByUserName ?? '—',
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
        Cell: ({ cell }) => new Date(cell.getValue<string>()).toLocaleDateString(),
      },
      {
        accessorKey: 'updatedAt',
        header: t('requestLines.columns.updatedAt'),
        size: 120,
        grow: false,
        Cell: ({ cell }) => new Date(cell.getValue<string>()).toLocaleDateString(),
      },
    ],
    [t],
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
}
