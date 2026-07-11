import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Typography,
} from '@mui/material';
import type { MRT_ColumnDef, MRT_PaginationState } from 'material-react-table';
import { useTranslation } from 'react-i18next';

import type { PurchaseSelectionSummary } from '@/api/generated/models/purchaseSelectionSummary';
import type { PurchaseSelectionSummaryStatus } from '@/api/generated/models/purchaseSelectionSummaryStatus';
import { useListSelectionsQuery } from '@/api/endpoints/selectionsApi';
import { ApiErrorAlert } from '@/components/ApiErrorAlert';
import { PaginatedTable } from '@/components/PaginatedTable';
import { SelectionStatusBadge } from '@/components/SelectionStatusBadge';
import { useAppSelector } from '@/hooks/useAppSelector';

const PAGE_SIZE = 20;

const STATUS_OPTIONS: Array<PurchaseSelectionSummaryStatus | 'ALL'> = [
  'ALL',
  'DRAFT',
  'CONFIRMED',
  'CANCELLED',
];

export function SelectionsPage() {
  const { t } = useTranslation('selections');
  const navigate = useNavigate();
  const companyId = useAppSelector((state) => state.auth.activeCompanyId);

  const [pagination, setPagination] = useState<MRT_PaginationState>({
    pageIndex: 0,
    pageSize: PAGE_SIZE,
  });
  const [statusFilter, setStatusFilter] = useState<
    PurchaseSelectionSummaryStatus | 'ALL'
  >('ALL');

  const listQuery = useListSelectionsQuery(
    {
      companyId: companyId ?? '',
      limit: pagination.pageSize,
      offset: pagination.pageIndex * pagination.pageSize,
      ...(statusFilter !== 'ALL' ? { status: statusFilter } : {}),
    },
    { skip: !companyId },
  );

  const columns = useMemo<MRT_ColumnDef<PurchaseSelectionSummary>[]>(
    () => [
      {
        id: 'request',
        header: t('columns.request'),
        Cell: ({ row }) => row.original.materialRequestId.slice(0, 8),
      },
      {
        accessorKey: 'status',
        header: t('columns.status'),
        Cell: ({ cell }) => (
          <SelectionStatusBadge
            status={cell.getValue<PurchaseSelectionSummaryStatus>()}
          />
        ),
      },
      {
        accessorKey: 'confirmedAt',
        header: t('columns.confirmedAt'),
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

  if (!companyId) {
    return null;
  }

  const selections = listQuery.data?.selections ?? [];
  const total = listQuery.data?.pagination.total ?? 0;

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h5" component="h1">
          {t('title')}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {t('subtitle')}
        </Typography>
      </Box>

      <ApiErrorAlert error={listQuery.error} />

      <FormControl size="small" sx={{ minWidth: 200 }}>
        <InputLabel id="selection-status-filter">
          {t('statusFilter.label')}
        </InputLabel>
        <Select
          labelId="selection-status-filter"
          label={t('statusFilter.label')}
          value={statusFilter}
          onChange={(event) => {
            setStatusFilter(
              event.target.value as PurchaseSelectionSummaryStatus | 'ALL',
            );
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

      {!listQuery.isLoading && selections.length === 0 ? (
        <Typography color="text.secondary">{t('empty.list')}</Typography>
      ) : (
        <PaginatedTable
          columns={columns}
          data={selections}
          rowCount={total}
          pagination={pagination}
          onPaginationChange={setPagination}
          isLoading={listQuery.isLoading}
          isFetching={listQuery.isFetching}
          onRowClick={(row) => navigate(`/app/selections/${row.id}`)}
          getRowId={(row) => row.id}
        />
      )}
    </Stack>
  );
}
