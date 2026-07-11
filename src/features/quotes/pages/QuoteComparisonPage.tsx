import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Button, Stack, Typography } from '@mui/material';
import {
  MaterialReactTable,
  useMaterialReactTable,
  type MRT_ColumnDef,
} from 'material-react-table';
import { useTranslation } from 'react-i18next';

import type { QuoteComparisonLine } from '@/api/generated/models/quoteComparisonLine';
import type { QuoteComparisonSupplier } from '@/api/generated/models/quoteComparisonSupplier';
import type { QuoteOffer } from '@/api/generated/models/quoteOffer';
import { useGetQuoteComparisonQuery } from '@/api/endpoints/requestsApi';
import { ApiErrorAlert } from '@/components/ApiErrorAlert';
import { DecimalDisplay } from '@/components/DecimalDisplay';
import { QuoteStatusBadge } from '@/components/QuoteStatusBadge';
import { DocumentDetailLayout } from '@/layouts/DocumentDetailLayout';
import { StatusBadge } from '@/components/StatusBadge';
import { PermissionGate } from '@/components/PermissionGate';
import { useOpenRequestSelection } from '@/features/selections/hooks/useOpenRequestSelection';
import { useAppSelector } from '@/hooks/useAppSelector';

type ComparisonRow = QuoteComparisonLine & {
  id: string;
};

function findOffer(
  offers: QuoteOffer[],
  supplierCompanyId: string,
): QuoteOffer | undefined {
  return offers.find(
    (offer) => offer.supplierCompany.id === supplierCompanyId,
  );
}

export function QuoteComparisonPage() {
  const { t } = useTranslation(['quotes', 'selections']);
  const { requestId } = useParams<{ requestId: string }>();
  const companyId = useAppSelector((state) => state.auth.activeCompanyId);
  const { openRequestSelection, isOpening, error: openSelectionError } =
    useOpenRequestSelection();

  const comparisonQuery = useGetQuoteComparisonQuery(
    { companyId: companyId ?? '', requestId: requestId ?? '' },
    { skip: !companyId || !requestId },
  );

  const comparison = comparisonQuery.data;
  const request = comparison?.request;
  const lines = comparison?.lines ?? [];
  const suppliers = comparison?.suppliers ?? [];

  const tableData = useMemo<ComparisonRow[]>(
    () =>
      lines.map((line) => ({
        ...line,
        id: line.requestLine.id,
      })),
    [lines],
  );

  const columns = useMemo<MRT_ColumnDef<ComparisonRow>[]>(() => {
    const baseColumns: MRT_ColumnDef<ComparisonRow>[] = [
      {
        id: 'lineNumber',
        header: t('comparison.columns.lineNumber'),
        size: 60,
        Cell: ({ row }) => row.original.requestLine.lineNumber,
        muiTableHeadCellProps: {
          sx: { position: 'sticky', left: 0, zIndex: 2, bgcolor: 'background.paper' },
        },
        muiTableBodyCellProps: {
          sx: { position: 'sticky', left: 0, zIndex: 1, bgcolor: 'background.paper' },
        },
      },
      {
        id: 'description',
        header: t('comparison.columns.description'),
        Cell: ({ row }) => row.original.requestLine.description,
        muiTableHeadCellProps: {
          sx: { position: 'sticky', left: 60, zIndex: 2, bgcolor: 'background.paper' },
        },
        muiTableBodyCellProps: {
          sx: { position: 'sticky', left: 60, zIndex: 1, bgcolor: 'background.paper' },
        },
      },
      {
        id: 'quantity',
        header: t('comparison.columns.quantity'),
        Cell: ({ row }) => (
          <DecimalDisplay value={row.original.requestLine.quantity} />
        ),
      },
      {
        id: 'unit',
        header: t('comparison.columns.unit'),
        Cell: ({ row }) => row.original.requestLine.unit ?? '—',
      },
    ];

    const supplierColumns: MRT_ColumnDef<ComparisonRow>[] = suppliers.map(
      (supplier: QuoteComparisonSupplier) => ({
        id: `supplier-${supplier.companyId}`,
        header: supplier.name,
        Header: () => (
          <Stack spacing={0.5}>
            <Typography variant="subtitle2">{supplier.name}</Typography>
            <QuoteStatusBadge status={supplier.status} />
            {supplier.submittedAt ? (
              <Typography variant="caption" color="text.secondary">
                {new Date(supplier.submittedAt).toLocaleString()}
              </Typography>
            ) : null}
          </Stack>
        ),
        Cell: ({ row }) => {
          const offer = findOffer(row.original.offers, supplier.companyId);
          if (!offer) {
            return '—';
          }

          return (
            <Stack spacing={0.25}>
              <Typography variant="body2">
                {t('comparison.cell.unitPrice')}:{' '}
                <DecimalDisplay value={offer.unitPrice} />
              </Typography>
              <Typography variant="body2">
                {t('comparison.cell.quantity')}:{' '}
                <DecimalDisplay value={offer.quantity} />
              </Typography>
              <Typography variant="body2">
                {t('comparison.cell.total')}:{' '}
                <DecimalDisplay value={offer.lineTotal} /> {offer.currency}
              </Typography>
            </Stack>
          );
        },
      }),
    );

    return [...baseColumns, ...supplierColumns];
  }, [suppliers, t]);

  const table = useMaterialReactTable({
    columns,
    data: tableData,
    enableColumnActions: false,
    enableColumnFilters: false,
    enableSorting: false,
    enableTopToolbar: false,
    enableBottomToolbar: false,
    getRowId: (row) => row.id,
    muiTablePaperProps: {
      elevation: 0,
      sx: { border: 1, borderColor: 'divider', overflowX: 'auto' },
    },
  });

  if (!companyId || !requestId) {
    return null;
  }

  const title =
    request?.title ??
    request?.reference ??
    t('comparison.fallbackTitle', { id: requestId.slice(0, 8) });

  return (
    <DocumentDetailLayout
      title={title}
      subtitle={request?.reference ? t('comparison.reference', { reference: request.reference }) : null}
      statusBadge={
        request?.status ? <StatusBadge status={request.status} /> : undefined
      }
      backTo={`/app/requests/${requestId}`}
      backLabel={t('comparison.backToRequest')}
      loading={comparisonQuery.isLoading}
      error={comparisonQuery.error}
      actions={
        requestId ? (
          <PermissionGate permission="manageSelections">
            <Button
              variant="contained"
              onClick={() => openRequestSelection(requestId)}
              disabled={isOpening}
            >
              {t('selections:actions.openSelection')}
            </Button>
          </PermissionGate>
        ) : null
      }
    >
      <Stack spacing={2}>
        <ApiErrorAlert error={comparisonQuery.error} />
        <ApiErrorAlert error={openSelectionError} />

        {suppliers.length === 0 ? (
          <Typography color="text.secondary">
            {t('comparison.empty')}
          </Typography>
        ) : (
          <Box>
            <MaterialReactTable table={table} />
          </Box>
        )}
      </Stack>
    </DocumentDetailLayout>
  );
}
