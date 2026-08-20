import { useMemo } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Link, Stack, Typography, useTheme } from '@mui/material';
import { alpha } from '@mui/material/styles';
import NotesOutlinedIcon from '@mui/icons-material/NotesOutlined';
import { MaterialReactTable, type MRT_ColumnDef } from 'material-react-table';
import { useTranslation } from 'react-i18next';

import { DecimalDisplay } from '@/components/dataDisplay/decimalDisplay/DecimalDisplay';
import { ClampedTextDialog } from '@/components/dataDisplay/clampedTextDialog/ClampedTextDialog';
import { QuoteLineSelectionCell } from '@/features/quotes/components/quoteLineSelection/QuoteLineSelectionCell';
import type { OfferSelectionProps } from '@/features/quotes/components/quoteComparisonMatrix/QuoteComparisonMatrix';
import type { QuoteComparisonOfferRow } from '@/features/quotes/lib/buildQuoteComparisonRows';
import {
  formatQuoteDate,
  hasSelectedQuantity,
  resolveSelectedQuantity,
} from '@/features/quotes/lib/quoteComparisonSelection';
import { useAppMaterialReactTable } from '@/hooks/useAppMaterialReactTable';

interface OffersNestedTableProps extends OfferSelectionProps {
  offers: QuoteComparisonOfferRow[];
  unit?: string | null;
}

export function OffersNestedTable({
  offers,
  companyId,
  selectionEnabled,
  materialRequestId,
  unit,
}: OffersNestedTableProps) {
  const theme = useTheme();
  const { t } = useTranslation(['quotes', 'enums']);
  const selectedRowBg = alpha(theme.palette.success.main, 0.12);

  const columns = useMemo<MRT_ColumnDef<QuoteComparisonOfferRow>[]>(
    () => [
      {
        id: 'supplier',
        header: t('comparison.columns.supplier'),
        grow: true,
        Cell: ({ row }) => (
          <Stack spacing={0.5}>
            <Typography variant="body2">
              {row.original.offer.supplierCompany.name}
            </Typography>
            {row.original.variantIndex != null ? (
              <Typography variant="caption" color="text.secondary">
                {t('comparison.cell.variant', {
                  index: row.original.variantIndex,
                })}
              </Typography>
            ) : null}
          </Stack>
        ),
      },
      {
        id: 'quote',
        header: t('comparison.columns.quote'),
        size: 120,
        grow: false,
        Cell: ({ row }) => (
          <Link
            component={RouterLink}
            to={`/app/quotes/${row.original.offer.quoteId}`}
            underline="hover"
            variant="body2"
          >
            {formatQuoteDate(row.original.offer.createdAt)}
          </Link>
        ),
      },
      {
        id: 'notes',
        header: t('comparison.columns.notes'),
        size: 250,
        Cell: ({ row }) => (
          <ClampedTextDialog
            text={row.original.offer.notes}
            title={t('form.notes')}
            closeLabel={t('actions.cancel')}
            previewLines={2}
            icon={
              <NotesOutlinedIcon
                fontSize="small"
                color="action"
                sx={{ mt: 0.5, flex: '0 0 auto' }}
              />
            }
          />
        ),
      },
      {
        id: 'unitPrice',
        header: t('comparison.columns.unitPrice'),
        size: 120,
        grow: false,
        muiTableHeadCellProps: { align: 'right' },
        muiTableBodyCellProps: { align: 'right' },
        Cell: ({ row }) => (
          <DecimalDisplay
            value={row.original.offer.unitPrice}
            suffix={row.original.offer.currency}
            groupDigits
          />
        ),
      },
      {
        id: 'offerQuantity',
        header: t('comparison.columns.offerQuantity'),
        size: 120,
        grow: false,
        muiTableHeadCellProps: { align: 'right' },
        muiTableBodyCellProps: { align: 'right' },
        Cell: ({ row }) => (
          <DecimalDisplay value={row.original.offer.quantity} suffix={unit} />
        ),
      },
      {
        id: 'total',
        header: t('comparison.columns.total'),
        size: 140,
        grow: false,
        muiTableHeadCellProps: { align: 'right' },
        muiTableBodyCellProps: { align: 'right' },
        Cell: ({ row }) => (
          <DecimalDisplay
            value={row.original.offer.lineTotal}
            suffix={row.original.offer.currency}
            groupDigits
          />
        ),
      },
      {
        id: 'leadTime',
        header: t('comparison.columns.leadTime'),
        size: 120,
        grow: false,
        Cell: ({ row }) => {
          const { leadTime, leadTimeUnit } = row.original.offer;
          if (leadTime == null || !leadTimeUnit) {
            return '—';
          }

          return (
            <>
              {leadTime}{' '}
              {t(`enums:leadTimeUnit.${leadTimeUnit.toLowerCase()}`)}
            </>
          );
        },
      },
      {
        id: 'selection',
        header: t('columns.selectedQuantity'),
        size: 120,
        grow: false,
        muiTableHeadCellProps: { align: 'right' },
        muiTableBodyCellProps: { align: 'right' },
        Cell: ({ row }) => (
          <QuoteLineSelectionCell
            companyId={companyId}
            quoteId={row.original.offer.quoteId}
            lineId={row.original.offer.quoteLineId}
            maxQuantity={row.original.offer.quantity}
            selectedQuantity={resolveSelectedQuantity(row.original.offer)}
            unit={unit}
            materialRequestId={materialRequestId}
            disabled={!selectionEnabled}
          />
        ),
      },
    ],
    [companyId, materialRequestId, selectionEnabled, t, unit],
  );

  const table = useAppMaterialReactTable({
    columns,
    data: offers,
    getRowId: (row) => row.id,
    layoutMode: 'grid',
    enablePagination: false,
    enableBottomToolbar: false,
    enableTopToolbar: false,
    muiTablePaperProps: {
      elevation: 0,
      sx: {
        border: 0,
        boxShadow: 'none',
        bgcolor: 'transparent',
      },
    },
    muiTableBodyRowProps: ({ row }) => {
      const isSelected = hasSelectedQuantity(row.original.offer);
      return {
        sx: {
          bgcolor: isSelected ? selectedRowBg : 'transparent',
        },
      };
    },
    muiTableHeadCellProps: {
      sx: {
        bgcolor: 'transparent',
      },
    },
    muiTableBodyCellProps: ({ row }) => {
      const isSelected = hasSelectedQuantity(row.original.offer);
      return {
        sx: {
          bgcolor: isSelected ? selectedRowBg : 'transparent',
        },
      };
    },
  });

  if (offers.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary" sx={{ py: 1, px: 2 }}>
        —
      </Typography>
    );
  }

  return <MaterialReactTable table={table} />;
}
