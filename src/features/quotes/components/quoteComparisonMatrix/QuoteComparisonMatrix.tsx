import { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Stack,
  Typography,
  useTheme,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
  MaterialReactTable,
  type MRT_ColumnDef,
  type MRT_ExpandedState,
  type MRT_PaginationState,
} from 'material-react-table';
import { useTranslation } from 'react-i18next';

import type { MaterialRequestStatus } from '@/api/generated/models/materialRequestStatus';
import { useGetQuoteComparisonQuery } from '@/api/endpoints/requestsApi';
import { ApiErrorAlert } from '@/components/feedback/apiErrorAlert/ApiErrorAlert';
import { DecimalDisplay } from '@/components/dataDisplay/decimalDisplay/DecimalDisplay';
import { LineRowActionsMenu } from '@/components/actions/lineRowActionsMenu/LineRowActionsMenu';
import { OffersNestedTable } from '@/features/quotes/components/quoteComparisonMatrix/OffersNestedTable';
import {
  buildQuoteComparisonRows,
  comparisonHasOffers,
  comparisonHasSelectableOffers,
  type QuoteComparisonLineRow,
} from '@/features/quotes/lib/buildQuoteComparisonRows';
import {
  lineIsOverOrdered,
  sumLineSelectedQuantity,
} from '@/features/quotes/lib/quoteComparisonSelection';
import { SELECTABLE_REQUEST_STATUSES } from '@/features/quotes/lib/quoteSelection';
import { useAppMaterialReactTable } from '@/hooks/useAppMaterialReactTable';
import {
  MRT_NARROW_ACTIONS_SIZE,
  MRT_NARROW_LINE_NUMBER_SIZE,
  mrtFixedSizeColumnProps,
} from '@/lib/mrtNarrowColumns';

const PAGE_SIZE = 20;

export interface OfferSelectionProps {
  companyId: string;
  selectionEnabled: boolean;
  materialRequestId: string;
}

interface QuoteComparisonMatrixProps {
  companyId: string;
  requestId: string;
}

export function QuoteComparisonMatrix({
  companyId,
  requestId,
}: QuoteComparisonMatrixProps) {
  const theme = useTheme();
  const { t } = useTranslation('quotes');

  const comparisonQuery = useGetQuoteComparisonQuery(
    { companyId, requestId },
    { skip: !companyId || !requestId },
  );

  const lines = useMemo(
    () => comparisonQuery.data?.lines ?? [],
    [comparisonQuery.data?.lines],
  );
  const hasOffers = useMemo(() => comparisonHasOffers(lines), [lines]);
  const requestStatus = comparisonQuery.data?.request
    ?.status as MaterialRequestStatus | undefined;
  const selectionEnabled =
    requestStatus != null &&
    SELECTABLE_REQUEST_STATUSES.has(requestStatus) &&
    comparisonHasSelectableOffers(lines);

  const tableData = useMemo(() => buildQuoteComparisonRows(lines), [lines]);

  const [pagination, setPagination] = useState<MRT_PaginationState>({
    pageIndex: 0,
    pageSize: PAGE_SIZE,
  });

  useEffect(() => {
    const maxPageIndex = Math.max(
      0,
      Math.ceil(tableData.length / pagination.pageSize) - 1,
    );
    if (pagination.pageIndex > maxPageIndex) {
      setPagination((current) => ({ ...current, pageIndex: maxPageIndex }));
    }
  }, [tableData.length, pagination.pageIndex, pagination.pageSize]);

  const pagedTableData = useMemo(
    () =>
      tableData.slice(
        pagination.pageIndex * pagination.pageSize,
        pagination.pageIndex * pagination.pageSize + pagination.pageSize,
      ),
    [tableData, pagination.pageIndex, pagination.pageSize],
  );

  const columns = useMemo<MRT_ColumnDef<QuoteComparisonLineRow>[]>(
    () => [
      {
        id: 'actions',
        header: '',
        ...mrtFixedSizeColumnProps(MRT_NARROW_ACTIONS_SIZE),
        Cell: ({ row }) => (
          <LineRowActionsMenu
            lineageId={row.original.requestLine.lineageId}
            moreLabel={t('actions.more')}
            openTraceLabel={t('actions.openTrace')}
          />
        ),
      },
      {
        id: 'lineNumber',
        header: t('comparison.columns.lineNumber'),
        ...mrtFixedSizeColumnProps(MRT_NARROW_LINE_NUMBER_SIZE),
        Cell: ({ row }) => row.original.requestLine.lineNumber,
      },
      {
        id: 'description',
        header: t('comparison.columns.description'),
        grow: true,
        Cell: ({ row }) => row.original.requestLine.description,
      },
      {
        id: 'quantity',
        header: t('comparison.columns.quantity'),
        size: 120,
        grow: false,
        muiTableBodyCellProps: {
          align: 'right',
        },
        muiTableHeadCellProps: {
          align: 'right',
        },
        Cell: ({ row }) => (
          <DecimalDisplay
            value={row.original.requestLine.quantity}
            suffix={row.original.requestLine.unit ?? '—'}
          />
        ),
      },
      {
        id: 'selectedQuantity',
        header: t('columns.selectedQuantity'),
        size: 120,
        grow: false,
        muiTableBodyCellProps: {
          align: 'right',
        },
        muiTableHeadCellProps: {
          align: 'right',
        },
        Cell: ({ row }) => (
          <DecimalDisplay
            value={sumLineSelectedQuantity(row.original)}
            suffix={row.original.requestLine.unit ?? '—'}
          />
        ),
      },
    ],
    [t],
  );

  const [expanded, setExpanded] = useState<MRT_ExpandedState>({});

  const table = useAppMaterialReactTable({
    columns,
    data: pagedTableData,
    getRowId: (row) => row.id,
    layoutMode: 'grid',
    enableColumnResizing: false,
    manualPagination: true,
    rowCount: tableData.length,
    onPaginationChange: setPagination,
    enableBottomToolbar: true,
    enableExpandAll: true,
    getRowCanExpand: (row) => row.original.offers.length > 0,
    state: {
      expanded,
      pagination,
      isLoading: comparisonQuery.isLoading,
      showProgressBars: comparisonQuery.isFetching,
    },
    onExpandedChange: setExpanded,
    displayColumnDefOptions: {
      'mrt-row-expand': {
        header: '',
        ...mrtFixedSizeColumnProps(40),
      },
    },
    muiExpandButtonProps: ({ row }) =>
      row.getCanExpand()
        ? { size: 'small', sx: { p: 0.25 } }
        : {
            disabled: true,
            size: 'small',
            sx: { p: 0.25, visibility: 'hidden' },
          },
    muiTableBodyRowProps: ({ row }) => {
      const isOverOrdered = lineIsOverOrdered(row.original);
      return {
        sx: {
          bgcolor: isOverOrdered
            ? alpha(theme.palette.success.main, 0.08)
            : undefined,
        },
      };
    },
    renderDetailPanel: ({ row }) => {
      if (row.original.offers.length === 0) {
        return null;
      }

      return (
        <Box
          sx={{
            pl: { xs: 1, sm: 4 },
            pr: 1,
            py: 1,
            width: '100%',
          }}
        >
          <OffersNestedTable
            offers={row.original.offers}
            companyId={companyId}
            selectionEnabled={selectionEnabled}
            materialRequestId={requestId}
            unit={row.original.requestLine.unit}
          />
        </Box>
      );
    },
  });

  return (
    <Stack spacing={2}>
      <ApiErrorAlert error={comparisonQuery.error} />

      {comparisonQuery.isLoading ? (
        <Typography color="text.secondary">
          {t('comparison.loading')}
        </Typography>
      ) : !hasOffers ? (
        <Typography color="text.secondary">{t('comparison.empty')}</Typography>
      ) : (
        <Box>
          <MaterialReactTable table={table} />
        </Box>
      )}
    </Stack>
  );
}
