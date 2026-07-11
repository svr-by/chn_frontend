import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Typography,
} from '@mui/material';
import type { MRT_ColumnDef, MRT_PaginationState } from 'material-react-table';
import { useTranslation } from 'react-i18next';

import type { ConsolidationSummary } from '@/api/generated/models/consolidationSummary';
import type { ConsolidationSummaryStatus } from '@/api/generated/models/consolidationSummaryStatus';
import { useListConsolidationsQuery } from '@/api/endpoints/consolidationsApi';
import { ApiErrorAlert } from '@/components/ApiErrorAlert';
import { ConsolidationStatusBadge } from '@/components/ConsolidationStatusBadge';
import { PaginatedTable } from '@/components/PaginatedTable';
import { PermissionGate } from '@/components/PermissionGate';
import { ConsolidationCreateDialog } from '@/features/consolidations/components/ConsolidationCreateDialog';
import { useAppSelector } from '@/hooks/useAppSelector';

const PAGE_SIZE = 20;

const STATUS_OPTIONS: Array<ConsolidationSummaryStatus | 'ALL'> = [
  'ALL',
  'DRAFT',
  'PLANNED',
  'IN_TRANSIT',
  'CUSTOMS',
  'DELIVERED',
];

export function ConsolidationsPage() {
  const { t } = useTranslation('consolidations');
  const { t: tEnums } = useTranslation('enums');
  const navigate = useNavigate();
  const companyId = useAppSelector((state) => state.auth.activeCompanyId);

  const [pagination, setPagination] = useState<MRT_PaginationState>({
    pageIndex: 0,
    pageSize: PAGE_SIZE,
  });
  const [statusFilter, setStatusFilter] = useState<
    ConsolidationSummaryStatus | 'ALL'
  >('ALL');
  const [createOpen, setCreateOpen] = useState(false);

  useEffect(() => {
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  }, [statusFilter]);

  const listQuery = useListConsolidationsQuery(
    {
      companyId: companyId ?? '',
      limit: pagination.pageSize,
      offset: pagination.pageIndex * pagination.pageSize,
      direction: 'participant',
      ...(statusFilter !== 'ALL' ? { status: statusFilter } : {}),
    },
    { skip: !companyId },
  );

  const columns = useMemo<MRT_ColumnDef<ConsolidationSummary>[]>(
    () => [
      {
        accessorKey: 'status',
        header: t('columns.status'),
        Cell: ({ cell }) => (
          <ConsolidationStatusBadge
            status={cell.getValue<ConsolidationSummaryStatus>()}
          />
        ),
      },
      {
        accessorKey: 'transportMode',
        header: t('columns.transportMode'),
        Cell: ({ cell }) => {
          const value = cell.getValue<string | null>();
          return value
            ? tEnums(`transportMode.${value.toLowerCase()}`)
            : '—';
        },
      },
      {
        accessorKey: 'carrier',
        header: t('columns.carrier'),
        Cell: ({ cell }) => cell.getValue<string | null>() ?? '—',
      },
      {
        accessorKey: 'trackingNumber',
        header: t('columns.trackingNumber'),
        Cell: ({ cell }) => cell.getValue<string | null>() ?? '—',
      },
      {
        accessorKey: 'origin',
        header: t('columns.origin'),
        Cell: ({ cell }) => cell.getValue<string | null>() ?? '—',
      },
      {
        accessorKey: 'destination',
        header: t('columns.destination'),
        Cell: ({ cell }) => cell.getValue<string | null>() ?? '—',
      },
      {
        accessorKey: 'shippingInvoiceCount',
        header: t('columns.shippingInvoiceCount'),
      },
      {
        id: 'buyer',
        header: t('columns.buyer'),
        Cell: ({ row }) => row.original.buyerCompany?.name ?? '—',
      },
      {
        accessorKey: 'plannedAt',
        header: t('columns.plannedAt'),
        Cell: ({ cell }) => {
          const value = cell.getValue<string | null>();
          return value ? new Date(value).toLocaleString() : '—';
        },
      },
      {
        accessorKey: 'deliveredAt',
        header: t('columns.deliveredAt'),
        Cell: ({ cell }) => {
          const value = cell.getValue<string | null>();
          return value ? new Date(value).toLocaleString() : '—';
        },
      },
    ],
    [t, tEnums],
  );

  return (
    <Box>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="flex-start"
        sx={{ mb: 3 }}
      >
        <Box>
          <Typography variant="h4" gutterBottom>
            {t('title')}
          </Typography>
          <Typography color="text.secondary">{t('subtitle')}</Typography>
        </Box>
        <PermissionGate permission="manageConsolidations">
          <Button variant="contained" onClick={() => setCreateOpen(true)}>
            {t('actions.create')}
          </Button>
        </PermissionGate>
      </Stack>

      <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
        <FormControl size="small" sx={{ minWidth: 180 }}>
          <InputLabel id="consolidation-status-filter">
            {t('statusFilter.label')}
          </InputLabel>
          <Select
            labelId="consolidation-status-filter"
            label={t('statusFilter.label')}
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(
                event.target.value as ConsolidationSummaryStatus | 'ALL',
              )
            }
          >
            {STATUS_OPTIONS.map((status) => (
              <MenuItem key={status} value={status}>
                {status === 'ALL'
                  ? t('statusFilter.all')
                  : t(`statusFilter.${status.toLowerCase()}`)}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Stack>

      <ApiErrorAlert error={listQuery.error} />

      {!listQuery.isLoading &&
      (listQuery.data?.consolidations.length ?? 0) === 0 ? (
        <Typography color="text.secondary">{t('empty.list')}</Typography>
      ) : (
        <PaginatedTable<ConsolidationSummary>
          columns={columns}
          data={listQuery.data?.consolidations ?? []}
          rowCount={listQuery.data?.pagination.total ?? 0}
          pagination={pagination}
          onPaginationChange={setPagination}
          isLoading={listQuery.isLoading}
          isFetching={listQuery.isFetching}
          onRowClick={(row) => navigate(`/app/consolidations/${row.id}`)}
          getRowId={(row) => row.id}
        />
      )}

      <ConsolidationCreateDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
      />
    </Box>
  );
}
