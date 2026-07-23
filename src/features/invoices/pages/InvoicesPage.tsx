import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Tab,
  Tabs,
  Typography,
} from '@mui/material';
import type { MRT_ColumnDef, MRT_PaginationState } from 'material-react-table';
import { useTranslation } from 'react-i18next';

import type { GetCompaniesCompanyIdInvoicesDirection } from '@/api/generated/models/getCompaniesCompanyIdInvoicesDirection';
import type { SupplierInvoiceSummary } from '@/api/generated/models/supplierInvoiceSummary';
import type { SupplierInvoiceSummaryStatus } from '@/api/generated/models/supplierInvoiceSummaryStatus';
import { useListInvoicesQuery } from '@/api/endpoints/invoicesApi';
import { ApiErrorAlert } from '@/components/ApiErrorAlert';
import { InvoiceStatusBadge } from '@/components/InvoiceStatusBadge';
import { PaginatedTable } from '@/components/PaginatedTable';
import { PermissionGate } from '@/components/PermissionGate';
import { InvoiceCreateDialog } from '@/features/invoices/components/InvoiceCreateDialog';
import { useAppSelector } from '@/hooks/useAppSelector';

const PAGE_SIZE = 20;

const STATUS_OPTIONS: Array<SupplierInvoiceSummaryStatus | 'ALL'> = [
  'ALL',
  'DRAFT',
  'ISSUED',
  'PARTIALLY_PAID',
  'PAID',
  'CONFIRMED',
];

const DIRECTION_TABS: GetCompaniesCompanyIdInvoicesDirection[] = [
  'inbound',
  'outbound',
];

export function InvoicesPage() {
  const { t } = useTranslation('invoices');
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const companyId = useAppSelector((state) => state.auth.activeCompanyId);

  const directionParam = searchParams.get('direction');
  const direction: GetCompaniesCompanyIdInvoicesDirection =
    directionParam === 'outbound' ? 'outbound' : 'inbound';
  const requestIdFilter = searchParams.get('requestId') ?? undefined;

  const tabIndex = direction === 'outbound' ? 1 : 0;

  const [pagination, setPagination] = useState<MRT_PaginationState>({
    pageIndex: 0,
    pageSize: PAGE_SIZE,
  });
  const [statusFilter, setStatusFilter] = useState<
    SupplierInvoiceSummaryStatus | 'ALL'
  >('ALL');
  const [createOpen, setCreateOpen] = useState(false);

  useEffect(() => {
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  }, [direction, statusFilter, requestIdFilter]);

  const listQuery = useListInvoicesQuery(
    {
      companyId: companyId ?? '',
      limit: pagination.pageSize,
      offset: pagination.pageIndex * pagination.pageSize,
      direction,
      ...(requestIdFilter ? { requestId: requestIdFilter } : {}),
      ...(statusFilter !== 'ALL' ? { status: statusFilter } : {}),
    },
    { skip: !companyId },
  );

  const columns = useMemo<MRT_ColumnDef<SupplierInvoiceSummary>[]>(
    () => [
      {
        id: 'counterparty',
        header:
          direction === 'inbound' ? t('columns.supplier') : t('columns.buyer'),
        Cell: ({ row }) =>
          direction === 'inbound'
            ? (row.original.supplierCompany?.name ?? '—')
            : (row.original.buyerCompany?.name ?? '—'),
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
          <InvoiceStatusBadge
            status={cell.getValue<SupplierInvoiceSummaryStatus>()}
          />
        ),
      },
      {
        accessorKey: 'invoiceNumber',
        header: t('columns.invoiceNumber'),
        Cell: ({ cell }) => cell.getValue<string | null>() ?? '—',
      },
      {
        accessorKey: 'issuedAt',
        header: t('columns.issuedAt'),
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
    [direction, t],
  );

  function handleTabChange(_event: React.SyntheticEvent, value: number) {
    const nextDirection = DIRECTION_TABS[value];
    const params = new URLSearchParams(searchParams);
    params.set('direction', nextDirection);
    setSearchParams(params);
  }

  function clearRequestFilter() {
    const params = new URLSearchParams(searchParams);
    params.delete('requestId');
    setSearchParams(params);
  }

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
        {direction === 'outbound' ? (
          <PermissionGate permission="manageInvoices">
            <Button variant="contained" onClick={() => setCreateOpen(true)}>
              {t('actions.create')}
            </Button>
          </PermissionGate>
        ) : null}
      </Stack>

      <Tabs value={tabIndex} onChange={handleTabChange} sx={{ mb: 3 }}>
        <Tab label={t('tabs.inbound')} />
        <Tab label={t('tabs.outbound')} />
      </Tabs>

      {requestIdFilter ? (
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary">
            {t('filter.request', { id: requestIdFilter.slice(0, 8) })}
          </Typography>
          <Typography
            component="button"
            variant="body2"
            onClick={clearRequestFilter}
            sx={{
              cursor: 'pointer',
              border: 'none',
              background: 'none',
              color: 'primary.main',
            }}
          >
            {t('filter.clearRequest')}
          </Typography>
        </Stack>
      ) : null}

      <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
        <FormControl size="small" sx={{ minWidth: 180 }}>
          <InputLabel id="invoice-status-filter">
            {t('statusFilter.label')}
          </InputLabel>
          <Select
            labelId="invoice-status-filter"
            label={t('statusFilter.label')}
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(
                event.target.value as SupplierInvoiceSummaryStatus | 'ALL',
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

      {!listQuery.isLoading && (listQuery.data?.invoices.length ?? 0) === 0 ? (
        <Typography color="text.secondary">{t('empty.list')}</Typography>
      ) : (
        <PaginatedTable<SupplierInvoiceSummary>
          columns={columns}
          data={listQuery.data?.invoices ?? []}
          rowCount={listQuery.data?.pagination.total ?? 0}
          pagination={pagination}
          onPaginationChange={setPagination}
          isLoading={listQuery.isLoading}
          isFetching={listQuery.isFetching}
          onRowClick={(row) => navigate(`/app/invoices/${row.id}`)}
          getRowId={(row) => row.id}
        />
      )}

      <InvoiceCreateDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        initialRequestId={requestIdFilter}
      />
    </Box>
  );
}
