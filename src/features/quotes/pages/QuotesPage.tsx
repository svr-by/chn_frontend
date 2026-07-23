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

import type { SupplierQuoteSummary } from '@/api/generated/models/supplierQuoteSummary';
import type { SupplierQuoteStatus } from '@/api/generated/models/supplierQuoteStatus';
import { useListQuotesQuery } from '@/api/endpoints/quotesApi';
import { ApiErrorAlert } from '@/components/ApiErrorAlert';
import { PaginatedTable } from '@/components/PaginatedTable';
import { QuoteStatusBadge } from '@/components/QuoteStatusBadge';
import { useAppSelector } from '@/hooks/useAppSelector';

const PAGE_SIZE = 20;

const STATUS_OPTIONS: Array<SupplierQuoteStatus | 'ALL'> = [
  'ALL',
  'DRAFT',
  'SUBMITTED',
  'PARTIALLY_ACCEPTED',
  'ACCEPTED',
  'REJECTED',
  'EXPIRED',
];

export function QuotesPage() {
  const { t } = useTranslation('quotes');
  const navigate = useNavigate();
  const companyId = useAppSelector((state) => state.auth.activeCompanyId);

  const [pagination, setPagination] = useState<MRT_PaginationState>({
    pageIndex: 0,
    pageSize: PAGE_SIZE,
  });
  const [statusFilter, setStatusFilter] = useState<SupplierQuoteStatus | 'ALL'>(
    'ALL',
  );

  const listQuery = useListQuotesQuery(
    {
      companyId: companyId ?? '',
      limit: pagination.pageSize,
      offset: pagination.pageIndex * pagination.pageSize,
      ...(statusFilter !== 'ALL' ? { status: statusFilter } : {}),
    },
    { skip: !companyId },
  );

  const columns = useMemo<MRT_ColumnDef<SupplierQuoteSummary>[]>(
    () => [
      {
        id: 'buyer',
        header: t('columns.buyer'),
        Cell: ({ row }) => row.original.buyerCompany?.name ?? '—',
      },
      {
        id: 'request',
        header: t('columns.request'),
        Cell: ({ row }) => row.original.materialRequestId.slice(0, 8),
      },
      {
        accessorKey: 'status',
        header: t('columns.status'),
        Cell: ({ cell }) => (
          <QuoteStatusBadge status={cell.getValue<SupplierQuoteStatus>()} />
        ),
      },
      {
        accessorKey: 'currency',
        header: t('columns.currency'),
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

  if (!companyId) {
    return null;
  }

  const quotes = listQuery.data?.quotes ?? [];
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
        <InputLabel id="quote-status-filter">
          {t('statusFilter.label')}
        </InputLabel>
        <Select
          labelId="quote-status-filter"
          label={t('statusFilter.label')}
          value={statusFilter}
          onChange={(event) => {
            setStatusFilter(event.target.value as SupplierQuoteStatus | 'ALL');
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

      {!listQuery.isLoading && quotes.length === 0 ? (
        <Typography color="text.secondary">{t('empty.list')}</Typography>
      ) : (
        <PaginatedTable
          columns={columns}
          data={quotes}
          rowCount={total}
          pagination={pagination}
          onPaginationChange={setPagination}
          isLoading={listQuery.isLoading}
          isFetching={listQuery.isFetching}
          onRowClick={(row) => navigate(`/app/quotes/${row.id}`)}
          getRowId={(row) => row.id}
        />
      )}
    </Stack>
  );
}
