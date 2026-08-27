import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
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

import type { PaymentSummary } from '@/api/generated/models/paymentSummary';
import type { PaymentSummaryStatus } from '@/api/generated/models/paymentSummaryStatus';
import { useListPaymentsQuery } from '@/api/endpoints/paymentsApi';
import { ApiErrorAlert } from '@/components/feedback/apiErrorAlert/ApiErrorAlert';
import { DecimalDisplay } from '@/components/dataDisplay/decimalDisplay/DecimalDisplay';
import { PaginatedTable } from '@/components/tables/paginatedTable/PaginatedTable';
import { PaymentStatusBadge } from '@/components/status/paymentStatusBadge/PaymentStatusBadge';
import { useAppSelector } from '@/hooks/useAppSelector';
import { PageShell } from '@/layouts/pageShell/PageShell';
import { DEFAULT_PAGE_SIZE } from '@/lib/pagination';


const STATUS_OPTIONS: Array<PaymentSummaryStatus | 'ALL'> = [
  'ALL',
  'PENDING',
  'UPLOADED',
  'CONFIRMED',
  'REJECTED',
];

export function PaymentsPage() {
  const { t } = useTranslation('payments');
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const companyId = useAppSelector((state) => state.auth.activeCompanyId);

  const invoiceIdFilter = searchParams.get('invoiceId') ?? undefined;

  const [pagination, setPagination] = useState<MRT_PaginationState>({
    pageIndex: 0,
    pageSize: DEFAULT_PAGE_SIZE,
  });
  const [statusFilter, setStatusFilter] = useState<
    PaymentSummaryStatus | 'ALL'
  >('ALL');

  useEffect(() => {
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  }, [statusFilter, invoiceIdFilter]);

  const listQuery = useListPaymentsQuery(
    {
      companyId: companyId ?? '',
      limit: pagination.pageSize,
      offset: pagination.pageIndex * pagination.pageSize,
      ...(invoiceIdFilter ? { invoiceId: invoiceIdFilter } : {}),
      ...(statusFilter !== 'ALL' ? { status: statusFilter } : {}),
    },
    { skip: !companyId },
  );

  const columns = useMemo<MRT_ColumnDef<PaymentSummary>[]>(
    () => [
      {
        accessorKey: 'invoiceId',
        header: t('columns.invoice'),
        Cell: ({ cell }) => cell.getValue<string>().slice(0, 8),
      },
      {
        accessorKey: 'amount',
        header: t('columns.amount'),
        Cell: ({ row }) => (
          <DecimalDisplay
            value={row.original.amount}
            suffix={row.original.currency}
            groupDigits
          />
        ),
      },
      {
        accessorKey: 'status',
        header: t('columns.status'),
        Cell: ({ cell }) => (
          <PaymentStatusBadge status={cell.getValue<PaymentSummaryStatus>()} />
        ),
      },
      {
        accessorKey: 'createdAt',
        header: t('columns.createdAt'),
        Cell: ({ cell }) => new Date(cell.getValue<string>()).toLocaleString(),
      },
    ],
    [t],
  );

  function clearInvoiceFilter() {
    const params = new URLSearchParams(searchParams);
    params.delete('invoiceId');
    setSearchParams(params);
  }

  return (
    <PageShell maxWidth="xl">
      <Box>
        <Typography variant="h4" gutterBottom>
          {t('title')}
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 3 }}>
          {t('subtitle')}
        </Typography>

        {invoiceIdFilter ? (
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary">
              {t('filter.invoice', { id: invoiceIdFilter.slice(0, 8) })}
            </Typography>
            <Typography
              component="button"
              variant="body2"
              onClick={clearInvoiceFilter}
              sx={{
                cursor: 'pointer',
                border: 'none',
                background: 'none',
                color: 'primary.main',
              }}
            >
              {t('filter.clearInvoice')}
            </Typography>
          </Stack>
        ) : null}

        <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel id="payment-status-filter">
              {t('statusFilter.label')}
            </InputLabel>
            <Select
              labelId="payment-status-filter"
              label={t('statusFilter.label')}
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(
                  event.target.value as PaymentSummaryStatus | 'ALL',
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
        (listQuery.data?.payments.length ?? 0) === 0 ? (
          <Typography color="text.secondary">{t('empty.list')}</Typography>
        ) : (
          <PaginatedTable<PaymentSummary>
            columns={columns}
            data={listQuery.data?.payments ?? []}
            rowCount={listQuery.data?.pagination.total ?? 0}
            pagination={pagination}
            onPaginationChange={setPagination}
            isLoading={listQuery.isLoading}
            isFetching={listQuery.isFetching}
            onRowClick={(row) => navigate(`/app/payments/${row.id}`)}
            getRowId={(row) => row.id}
          />
        )}
      </Box>
    </PageShell>
  );
}
