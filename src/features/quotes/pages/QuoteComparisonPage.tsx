import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  MaterialReactTable,
  type MRT_ColumnDef,
} from 'material-react-table';
import { useAppMaterialReactTable } from '@/hooks/useAppMaterialReactTable';
import { useTranslation } from 'react-i18next';

import type { QuoteComparisonLine } from '@/api/generated/models/quoteComparisonLine';
import type { QuoteComparisonSupplier } from '@/api/generated/models/quoteComparisonSupplier';
import type { QuoteOffer } from '@/api/generated/models/quoteOffer';
import { useGetQuoteComparisonQuery } from '@/api/endpoints/requestsApi';
import { ApiErrorAlert } from '@/components/ApiErrorAlert';
import { DecimalDisplay } from '@/components/DecimalDisplay';
import { LineageLink } from '@/components/LineageLink';
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

function ComparisonMobileCards({
  lines,
  suppliers,
}: {
  lines: ComparisonRow[];
  suppliers: QuoteComparisonSupplier[];
}) {
  const { t } = useTranslation('quotes');

  return (
    <Stack spacing={2}>
      {lines.map((line) => (
        <Card key={line.id} variant="outlined">
          <CardContent>
            <Stack spacing={1.5}>
              <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                <Typography variant="subtitle2">
                  #{line.requestLine.lineNumber}
                </Typography>
                <Typography variant="body1" sx={{ flex: 1 }}>
                  {line.requestLine.description}
                </Typography>
                <LineageLink lineageId={line.requestLine.lineageId} />
              </Stack>
              <Typography variant="body2" color="text.secondary">
                {t('comparison.columns.quantity')}:{' '}
                <DecimalDisplay value={line.requestLine.quantity} />{' '}
                {line.requestLine.unit ?? '—'}
              </Typography>
              <Divider />
              {suppliers.map((supplier) => {
                const offer = findOffer(line.offers, supplier.companyId);
                return (
                  <Box key={supplier.companyId}>
                    <Stack spacing={0.5}>
                      <Typography variant="subtitle2">{supplier.name}</Typography>
                      <QuoteStatusBadge status={supplier.status} />
                      {offer ? (
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
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          —
                        </Typography>
                      )}
                    </Stack>
                  </Box>
                );
              })}
            </Stack>
          </CardContent>
        </Card>
      ))}
    </Stack>
  );
}

export function QuoteComparisonPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
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
        id: 'lineage',
        header: t('comparison.columns.lineage'),
        Cell: ({ row }) => (
          <LineageLink lineageId={row.original.requestLine.lineageId} />
        ),
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

  const table = useAppMaterialReactTable({
    columns,
    data: tableData,
    getRowId: (row) => row.id,
    muiTablePaperProps: {
      sx: { overflowX: 'auto' },
    },
  });

  if (!companyId || !requestId) {
    return null;
  }

  const title =
    request?.title ??
    t('comparison.fallbackTitle', { id: requestId.slice(0, 8) });

  return (
    <DocumentDetailLayout
      title={title}
      statusBadge={
        request?.status ? <StatusBadge status={request.status} /> : undefined
      }
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
        ) : isMobile ? (
          <ComparisonMobileCards lines={tableData} suppliers={suppliers} />
        ) : (
          <Box>
            <MaterialReactTable table={table} />
          </Box>
        )}
      </Stack>
    </DocumentDetailLayout>
  );
}
