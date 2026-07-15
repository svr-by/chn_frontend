import { useMemo, useState } from 'react';
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

import type { MaterialRequestSummary } from '@/api/generated/models/materialRequestSummary';
import { useListRequestsQuery } from '@/api/endpoints/requestsApi';
import { ApiErrorAlert } from '@/components/ApiErrorAlert';
import { PaginatedTable } from '@/components/PaginatedTable';
import { StatusBadge } from '@/components/StatusBadge';
import type { MaterialRequestStatus } from '@/types/api';

const PAGE_SIZE = 20;

const STATUS_OPTIONS: Array<MaterialRequestStatus | 'ALL'> = [
  'ALL',
  'DRAFT',
  'SUBMITTED',
  'QUOTING',
  'PARTIALLY_ORDERED',
  'ORDERED',
  'CLOSED',
];

interface OutboundRequestsPanelProps {
  companyId: string;
}

export function OutboundRequestsPanel({ companyId }: OutboundRequestsPanelProps) {
  const { t } = useTranslation('requests');
  const navigate = useNavigate();

  const [pagination, setPagination] = useState<MRT_PaginationState>({
    pageIndex: 0,
    pageSize: PAGE_SIZE,
  });
  const [statusFilter, setStatusFilter] = useState<MaterialRequestStatus | 'ALL'>(
    'ALL',
  );

  const listQuery = useListRequestsQuery(
    {
      companyId,
      limit: pagination.pageSize,
      offset: pagination.pageIndex * pagination.pageSize,
      ...(statusFilter !== 'ALL' ? { status: statusFilter } : {}),
    },
    { skip: !companyId },
  );

  const columns = useMemo<MRT_ColumnDef<MaterialRequestSummary>[]>(
    () => [
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
        accessorKey: 'submittedAt',
        header: t('columns.submittedAt'),
        Cell: ({ cell }) => {
          const value = cell.getValue<string | null>();
          return value ? new Date(value).toLocaleString() : '—';
        },
      },
      {
        accessorKey: 'createdAt',
        header: t('columns.createdAt'),
        Cell: ({ cell }) => new Date(cell.getValue<string>()).toLocaleString(),
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
        <InputLabel id="request-status-filter">{t('statusFilter.label')}</InputLabel>
        <Select
          labelId="request-status-filter"
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
        <Typography color="text.secondary">{t('empty.list')}</Typography>
      ) : (
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
        />
      )}
    </>
  );
}
