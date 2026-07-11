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

import type { GetCompaniesCompanyIdShippingInvoicesDirection } from '@/api/generated/models/getCompaniesCompanyIdShippingInvoicesDirection';
import type { ShippingInvoiceSummary } from '@/api/generated/models/shippingInvoiceSummary';
import type { ShippingInvoiceSummaryStatus } from '@/api/generated/models/shippingInvoiceSummaryStatus';
import { useListShippingInvoicesQuery } from '@/api/endpoints/shippingInvoicesApi';
import { ApiErrorAlert } from '@/components/ApiErrorAlert';
import { PaginatedTable } from '@/components/PaginatedTable';
import { PermissionGate } from '@/components/PermissionGate';
import { ShippingInvoiceStatusBadge } from '@/components/ShippingInvoiceStatusBadge';
import { ShippingInvoiceCreateDialog } from '@/features/shipping/components/ShippingInvoiceCreateDialog';
import { useAppSelector } from '@/hooks/useAppSelector';

const PAGE_SIZE = 20;

const STATUS_OPTIONS: Array<ShippingInvoiceSummaryStatus | 'ALL'> = [
  'ALL',
  'DRAFT',
  'ISSUED',
  'IN_TRANSIT',
  'DELIVERED',
];

const DIRECTION_TABS: GetCompaniesCompanyIdShippingInvoicesDirection[] = [
  'inbound',
  'outbound',
];

export function ShippingInvoicesPage() {
  const { t } = useTranslation('shipping');
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const companyId = useAppSelector((state) => state.auth.activeCompanyId);

  const directionParam = searchParams.get('direction');
  const direction: GetCompaniesCompanyIdShippingInvoicesDirection =
    directionParam === 'outbound' ? 'outbound' : 'inbound';
  const supplierInvoiceIdFilter =
    searchParams.get('supplierInvoiceId') ?? undefined;
  const requestIdFilter = searchParams.get('requestId') ?? undefined;

  const tabIndex = direction === 'outbound' ? 1 : 0;

  const [pagination, setPagination] = useState<MRT_PaginationState>({
    pageIndex: 0,
    pageSize: PAGE_SIZE,
  });
  const [statusFilter, setStatusFilter] = useState<
    ShippingInvoiceSummaryStatus | 'ALL'
  >('ALL');
  const [createOpen, setCreateOpen] = useState(false);

  useEffect(() => {
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  }, [direction, statusFilter, supplierInvoiceIdFilter, requestIdFilter]);

  const listQuery = useListShippingInvoicesQuery(
    {
      companyId: companyId ?? '',
      limit: pagination.pageSize,
      offset: pagination.pageIndex * pagination.pageSize,
      direction,
      ...(supplierInvoiceIdFilter
        ? { supplierInvoiceId: supplierInvoiceIdFilter }
        : {}),
      ...(requestIdFilter ? { requestId: requestIdFilter } : {}),
      ...(statusFilter !== 'ALL' ? { status: statusFilter } : {}),
    },
    { skip: !companyId },
  );

  const columns = useMemo<MRT_ColumnDef<ShippingInvoiceSummary>[]>(
    () => [
      {
        id: 'counterparty',
        header:
          direction === 'inbound'
            ? t('columns.supplier')
            : t('columns.buyer'),
        Cell: ({ row }) =>
          direction === 'inbound'
            ? (row.original.supplierCompany?.name ?? '—')
            : (row.original.buyerCompany?.name ?? '—'),
      },
      {
        id: 'supplierInvoice',
        header: t('columns.supplierInvoice'),
        Cell: ({ row }) => row.original.supplierInvoiceId.slice(0, 8),
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
          <ShippingInvoiceStatusBadge
            status={cell.getValue<ShippingInvoiceSummaryStatus>()}
          />
        ),
      },
      {
        accessorKey: 'trackingNumber',
        header: t('columns.trackingNumber'),
        Cell: ({ cell }) => cell.getValue<string | null>() ?? '—',
      },
      {
        accessorKey: 'carrier',
        header: t('columns.carrier'),
        Cell: ({ cell }) => cell.getValue<string | null>() ?? '—',
      },
      {
        accessorKey: 'lineCount',
        header: t('columns.lineCount'),
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
        accessorKey: 'deliveredAt',
        header: t('columns.deliveredAt'),
        Cell: ({ cell }) => {
          const value = cell.getValue<string | null>();
          return value ? new Date(value).toLocaleString() : '—';
        },
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

  function clearSupplierInvoiceFilter() {
    const params = new URLSearchParams(searchParams);
    params.delete('supplierInvoiceId');
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
          <PermissionGate permission="manageShippingInvoices">
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

      {supplierInvoiceIdFilter ? (
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary">
            {t('filter.supplierInvoice', {
              id: supplierInvoiceIdFilter.slice(0, 8),
            })}
          </Typography>
          <Typography
            component="button"
            variant="body2"
            onClick={clearSupplierInvoiceFilter}
            sx={{
              cursor: 'pointer',
              border: 'none',
              background: 'none',
              color: 'primary.main',
            }}
          >
            {t('filter.clearSupplierInvoice')}
          </Typography>
        </Stack>
      ) : null}

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
          <InputLabel id="shipping-status-filter">
            {t('statusFilter.label')}
          </InputLabel>
          <Select
            labelId="shipping-status-filter"
            label={t('statusFilter.label')}
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(
                event.target.value as ShippingInvoiceSummaryStatus | 'ALL',
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
      (listQuery.data?.shippingInvoices.length ?? 0) === 0 ? (
        <Typography color="text.secondary">{t('empty.list')}</Typography>
      ) : (
        <PaginatedTable<ShippingInvoiceSummary>
          columns={columns}
          data={listQuery.data?.shippingInvoices ?? []}
          rowCount={listQuery.data?.pagination.total ?? 0}
          pagination={pagination}
          onPaginationChange={setPagination}
          isLoading={listQuery.isLoading}
          isFetching={listQuery.isFetching}
          onRowClick={(row) => navigate(`/app/shipping-invoices/${row.id}`)}
          getRowId={(row) => row.id}
        />
      )}

      <ShippingInvoiceCreateDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        initialSupplierInvoiceId={supplierInvoiceIdFilter}
      />
    </Box>
  );
}
