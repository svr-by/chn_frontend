import { memo, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Chip } from '@mui/material';
import type { MRT_ColumnDef, MRT_PaginationState } from 'material-react-table';
import { useTranslation } from 'react-i18next';

import type { InboundRequestLineListItem } from '@/api/generated/models/inboundRequestLineListItem';
import { useListInboundRequestLinesQuery } from '@/api/endpoints/requestsApi';
import { ApiErrorAlert } from '@/components/feedback/apiErrorAlert/ApiErrorAlert';
import { PaginatedTable } from '@/components/tables/paginatedTable/PaginatedTable';
import { createRequestLineListBaseColumns } from '@/features/requests/lib/requestLineListTableColumns';
import { formatLocalizedDate } from '@/lib/dateFormat';
import {
  buildInboundRequestLinesQueryArgs,
  type RequestLinesFiltersValue,
} from '@/features/requests/lib/requestLinesFilters';

const PAGE_SIZE = 20;

interface InboundRequestLinesPanelProps {
  companyId: string;
  filters: RequestLinesFiltersValue;
}

export const InboundRequestLinesPanel = memo(function InboundRequestLinesPanel({
  companyId,
  filters,
}: InboundRequestLinesPanelProps) {
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
      buildInboundRequestLinesQueryArgs({
        companyId,
        limit: pagination.pageSize,
        offset: pagination.pageIndex * pagination.pageSize,
        filters,
      }),
    [companyId, filters, pagination.pageIndex, pagination.pageSize],
  );

  const listQuery = useListInboundRequestLinesQuery(listParams, {
    skip: !companyId,
  });

  const columns = useMemo<MRT_ColumnDef<InboundRequestLineListItem>[]>(
    () => [
      ...createRequestLineListBaseColumns<InboundRequestLineListItem>(t),
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
          <Link to={`/app/requests/inbound/${row.original.request.id}`}>
            {row.original.request.title ??
              t('requestLines.fallbackRequest', {
                id: row.original.request.id.slice(0, 8),
              })}
          </Link>
        ),
      },
      {
        id: 'buyer',
        accessorFn: (row) => row.buyerCompany.name,
        header: t('inbound.columns.buyer'),
        size: 140,
        grow: false,
        Cell: ({ row }) => row.original.buyerCompany.name,
      },
      {
        id: 'hasQuote',
        accessorFn: (row) => row.links.hasQuote,
        header: t('requestLines.inbound.columns.hasQuote'),
        size: 120,
        grow: false,
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
        size: 120,
        grow: false,
        Cell: ({ cell }) => {
          const value = cell.getValue<string | null>();
          return formatLocalizedDate(value, i18n.language);
        },
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
