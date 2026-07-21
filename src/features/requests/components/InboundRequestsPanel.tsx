import { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography,
} from '@mui/material';
import type { MRT_ColumnDef, MRT_PaginationState } from 'material-react-table';
import { useTranslation } from 'react-i18next';

import type { InboundMaterialRequestSummary } from '@/api/generated/models/inboundMaterialRequestSummary';
import type { MaterialRequestStatus } from '@/types/api';
import { useListInboundRequestsQuery } from '@/api/endpoints/requestsApi';
import { ApiErrorAlert } from '@/components/ApiErrorAlert';
import { PaginatedTable } from '@/components/PaginatedTable';
import { StatusBadge } from '@/components/StatusBadge';

const PAGE_SIZE = 20;

const STATUS_OPTIONS: Array<MaterialRequestStatus | 'ALL'> = [
  'ALL',
  'QUOTING',
  'PARTIALLY_ORDERED',
  'ORDERED',
  'CLOSED',
];

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
  const [statusFilter, setStatusFilter] = useState<MaterialRequestStatus | 'ALL'>(
    'ALL',
  );

  const listQuery = useListInboundRequestsQuery(
    {
      companyId,
      limit: pagination.pageSize,
      offset: pagination.pageIndex * pagination.pageSize,
      ...(statusFilter !== 'ALL' ? { status: statusFilter } : {}),
    },
    { skip: !companyId },
  );

  const handleRowClick = useCallback(
    (request: InboundMaterialRequestSummary) => {
      navigate(`/app/requests/inbound/${request.id}`);
    },
    [navigate],
  );

  const columns = useMemo<MRT_ColumnDef<InboundMaterialRequestSummary>[]>(
    () => [
      {
        id: 'buyer',
        header: t('inbound.columns.buyer'),
        Cell: ({ row }) => row.original.buyerCompany.name,
      },
      {
        accessorKey: 'title',
        header: t('columns.title'),
        Cell: ({ cell }) => cell.getValue<string | null>() ?? '—',
      },
      {
        accessorKey: 'status',
        header: t('columns.status'),
        Cell: ({ cell }) => (
          <StatusBadge status={cell.getValue<MaterialRequestStatus>()} />
        ),
      },
      {
        accessorKey: 'lineCount',
        header: t('inbound.columns.lineCount'),
      },
      {
        accessorKey: 'distributedAt',
        header: t('inbound.columns.distributedAt'),
        Cell: ({ cell }) => {
          const value = cell.getValue<string | null>();
          return value ? new Date(value).toLocaleString() : '—';
        },
      },
    ],
    [t],
  );

  const requests = listQuery.data?.requests ?? [];
  const total = listQuery.data?.pagination.total ?? 0;

  return (
    <>
      <ApiErrorAlert error={listQuery.error} />

      <FormControl size="small" sx={{ minWidth: 200, mb: 3 }}>
        <InputLabel id="inbound-status-filter">{t('statusFilter.label')}</InputLabel>
        <Select
          labelId="inbound-status-filter"
          label={t('statusFilter.label')}
          value={statusFilter}
          onChange={(event) => {
            setStatusFilter(event.target.value as MaterialRequestStatus | 'ALL');
            setPagination((prev) => ({ ...prev, pageIndex: 0 }));
          }}
        >
          {STATUS_OPTIONS.map((status) => (
            <MenuItem key={status} value={status}>
              {status === 'ALL'
                ? t('statusFilter.all')
                : t(`statusFilter.${status.toLowerCase()}`, {
                    defaultValue: status,
                  })}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {!listQuery.isLoading && requests.length === 0 ? (
        <Typography color="text.secondary">{t('inbound.empty.list')}</Typography>
      ) : (
        <PaginatedTable
          columns={columns}
          data={requests}
          rowCount={total}
          pagination={pagination}
          onPaginationChange={setPagination}
          isLoading={listQuery.isLoading}
          isFetching={listQuery.isFetching}
          getRowId={(row) => row.id}
          onRowClick={handleRowClick}
        />
      )}
    </>
  );
}
