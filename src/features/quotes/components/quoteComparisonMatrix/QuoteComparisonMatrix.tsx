import { useEffect, useMemo, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Link,
  Stack,
  TablePagination,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  MaterialReactTable,
  type MRT_ColumnDef,
  type MRT_ExpandedState,
  type MRT_PaginationState,
} from 'material-react-table';
import { useTranslation } from 'react-i18next';

import type { MaterialRequestStatus } from '@/api/generated/models/materialRequestStatus';
import { useGetQuoteComparisonQuery } from '@/api/endpoints/requestsApi';
import { ApiErrorAlert } from '@/components/ApiErrorAlert';
import { DecimalDisplay } from '@/components/DecimalDisplay';
import { DecimalWithSuffix } from '@/components/DecimalWithSuffix';
import { LineRowActionsMenu } from '@/components/LineRowActionsMenu';
import { QuoteLineSelectionCell } from '@/features/quotes/components/quoteLineSelection/QuoteLineSelectionCell';
import {
  buildQuoteComparisonRows,
  comparisonHasOffers,
  comparisonHasSelectableOffers,
  type QuoteComparisonLineRow,
  type QuoteComparisonOfferRow,
} from '@/features/quotes/lib/buildQuoteComparisonRows';
import { SELECTABLE_REQUEST_STATUSES } from '@/features/quotes/lib/quoteSelection';
import { useAppMaterialReactTable } from '@/hooks/useAppMaterialReactTable';
import {
  MRT_NARROW_ACTIONS_SIZE,
  MRT_NARROW_LINE_NUMBER_SIZE,
  mrtFixedSizeColumnProps,
} from '@/lib/mrtNarrowColumns';
import { isDecimalGte, parseDecimal } from '@/lib/decimal';

const PAGE_SIZE = 20;

interface OfferSelectionProps {
  companyId: string;
  selectionEnabled: boolean;
  materialRequestId: string;
}

function resolveSelectedQuantity(
  offer: QuoteComparisonOfferRow['offer'],
): string | null {
  return offer.selectedQuantity ?? null;
}

function hasSelectedQuantity(
  offer: QuoteComparisonOfferRow['offer'],
): boolean {
  return resolveSelectedQuantity(offer) != null;
}

function sumLineSelectedQuantity(line: QuoteComparisonLineRow): string | null {
  let hasSelection = false;
  let total = parseDecimal('0');

  for (const offerRow of line.offers) {
    const selected = resolveSelectedQuantity(offerRow.offer);
    if (selected == null) {
      continue;
    }
    hasSelection = true;
    total = total.plus(parseDecimal(selected));
  }

  return hasSelection ? total.toString() : null;
}

function lineIsOverOrdered(line: QuoteComparisonLineRow): boolean {
  const selectedTotal = sumLineSelectedQuantity(line);
  if (selectedTotal == null) {
    return false;
  }
  return isDecimalGte(selectedTotal, line.requestLine.quantity);
}

function formatQuoteDate(value: string): string {
  return new Date(value).toLocaleDateString();
}

function OffersNestedTable({
  offers,
  companyId,
  selectionEnabled,
  materialRequestId,
}: { offers: QuoteComparisonOfferRow[] } & OfferSelectionProps) {
  const theme = useTheme();
  const { t } = useTranslation(['quotes', 'enums']);
  const selectedRowBg = alpha(theme.palette.success.main, 0.12);

  const columns = useMemo<MRT_ColumnDef<QuoteComparisonOfferRow>[]>(
    () => [
      {
        id: 'supplier',
        header: t('comparison.columns.supplier'),
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
        id: 'unitPrice',
        header: t('comparison.columns.unitPrice'),
        Cell: ({ row }) => (
          <DecimalWithSuffix
            value={row.original.offer.unitPrice}
            suffix={row.original.offer.currency}
          />
        ),
      },
      {
        id: 'offerQuantity',
        header: t('comparison.columns.offerQuantity'),
        Cell: ({ row }) => (
          <DecimalDisplay value={row.original.offer.quantity} />
        ),
      },
      {
        id: 'total',
        header: t('comparison.columns.total'),
        Cell: ({ row }) => (
          <DecimalWithSuffix
            value={row.original.offer.lineTotal}
            suffix={row.original.offer.currency}
          />
        ),
      },
      {
        id: 'leadTime',
        header: t('comparison.columns.leadTime'),
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
        Cell: ({ row }) => (
          <QuoteLineSelectionCell
            companyId={companyId}
            quoteId={row.original.offer.quoteId}
            lineId={row.original.offer.quoteLineId}
            maxQuantity={row.original.offer.quantity}
            selectedQuantity={resolveSelectedQuantity(row.original.offer)}
            materialRequestId={materialRequestId}
            disabled={!selectionEnabled}
          />
        ),
      },
    ],
    [companyId, materialRequestId, selectionEnabled, t],
  );

  const table = useAppMaterialReactTable({
    columns,
    data: offers,
    getRowId: (row) => row.id,
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

function OfferCardDetails({
  row,
  companyId,
  selectionEnabled,
  materialRequestId,
}: { row: QuoteComparisonOfferRow } & OfferSelectionProps) {
  const { t } = useTranslation(['quotes', 'enums']);
  const { offer } = row;

  return (
    <Stack spacing={0.25}>
      {row.variantIndex != null ? (
        <Typography variant="caption" color="text.secondary">
          {t('comparison.cell.variant', { index: row.variantIndex })}
        </Typography>
      ) : null}
      <Typography variant="body2">
        <Link
          component={RouterLink}
          to={`/app/quotes/${offer.quoteId}`}
          underline="hover"
        >
          {formatQuoteDate(offer.createdAt)}
        </Link>
      </Typography>
      <Typography variant="body2">
        {t('comparison.columns.unitPrice')}:{' '}
        <DecimalWithSuffix value={offer.unitPrice} suffix={offer.currency} />
      </Typography>
      <Typography variant="body2">
        {t('comparison.columns.offerQuantity')}:{' '}
        <DecimalDisplay value={offer.quantity} />
      </Typography>
      <Typography variant="body2">
        {t('comparison.columns.total')}:{' '}
        <DecimalWithSuffix value={offer.lineTotal} suffix={offer.currency} />
      </Typography>
      {offer.leadTime != null && offer.leadTimeUnit ? (
        <Typography variant="body2">
          {t('comparison.columns.leadTime')}: {offer.leadTime}{' '}
          {t(`enums:leadTimeUnit.${offer.leadTimeUnit.toLowerCase()}`)}
        </Typography>
      ) : null}
      <QuoteLineSelectionCell
        companyId={companyId}
        quoteId={offer.quoteId}
        lineId={offer.quoteLineId}
        maxQuantity={offer.quantity}
        selectedQuantity={resolveSelectedQuantity(offer)}
        materialRequestId={materialRequestId}
        disabled={!selectionEnabled}
      />
    </Stack>
  );
}

function ComparisonMobileCards({
  rows,
  companyId,
  selectionEnabled,
  materialRequestId,
}: { rows: QuoteComparisonLineRow[] } & OfferSelectionProps) {
  const { t } = useTranslation('quotes');

  return (
    <Stack spacing={1}>
      {rows.map((lineRow) => {
        const hasLineOffers = lineRow.offers.length > 0;
        const selectedTotal = sumLineSelectedQuantity(lineRow);
        const header = (
          <Stack spacing={0.5} sx={{ width: '100%', pr: 1 }}>
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              flexWrap="wrap"
            >
              <LineRowActionsMenu
                lineageId={lineRow.requestLine.lineageId}
                moreLabel={t('actions.more')}
                openTraceLabel={t('actions.openTrace')}
              />
              <Typography variant="subtitle2">
                #{lineRow.requestLine.lineNumber}
              </Typography>
              <Typography variant="body1" sx={{ flex: 1 }}>
                {lineRow.requestLine.description}
              </Typography>
            </Stack>
            <Typography variant="body2" color="text.secondary">
              {t('comparison.columns.quantity')}:{' '}
              <DecimalWithSuffix
                value={lineRow.requestLine.quantity}
                suffix={lineRow.requestLine.unit ?? '—'}
              />
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t('columns.selectedQuantity')}:{' '}
              <DecimalWithSuffix
                value={selectedTotal}
                suffix={lineRow.requestLine.unit ?? '—'}
              />
            </Typography>
          </Stack>
        );

        if (!hasLineOffers) {
          return (
            <Box
              key={lineRow.id}
              sx={{
                px: 2,
                py: 1.5,
                border: 1,
                borderColor: 'divider',
                borderRadius: 1,
              }}
            >
              {header}
            </Box>
          );
        }

        return (
          <Accordion
            key={lineRow.id}
            defaultExpanded
            sx={
              lineIsOverOrdered(lineRow)
                ? {
                    bgcolor: (theme) =>
                      alpha(theme.palette.success.main, 0.08),
                  }
                : undefined
            }
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              {header}
            </AccordionSummary>
            <AccordionDetails sx={{ bgcolor: 'action.hover' }}>
              <Stack spacing={1.5}>
                {lineRow.offers.map((offerRow) => {
                  const isSelected = hasSelectedQuantity(offerRow.offer);
                  return (
                    <Box
                      key={offerRow.id}
                      sx={{
                        p: 1,
                        borderRadius: 1,
                        bgcolor: isSelected
                          ? (theme) => alpha(theme.palette.success.main, 0.12)
                          : 'transparent',
                      }}
                    >
                      <Stack spacing={0.5}>
                        <Typography variant="subtitle2">
                          {offerRow.offer.supplierCompany.name}
                        </Typography>
                        <OfferCardDetails
                          row={offerRow}
                          companyId={companyId}
                          selectionEnabled={selectionEnabled}
                          materialRequestId={materialRequestId}
                        />
                      </Stack>
                    </Box>
                  );
                })}
              </Stack>
            </AccordionDetails>
          </Accordion>
        );
      })}
    </Stack>
  );
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
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
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
        Cell: ({ row }) => (
          <DecimalWithSuffix
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
        Cell: ({ row }) => (
          <DecimalWithSuffix
            value={sumLineSelectedQuantity(row.original)}
            suffix={row.original.requestLine.unit ?? '—'}
          />
        ),
      },
    ],
    [t],
  );

  const [expanded, setExpanded] = useState<MRT_ExpandedState>({});

  useEffect(() => {
    setExpanded(
      Object.fromEntries(
        pagedTableData
          .filter((row) => row.offers.length > 0)
          .map((row) => [row.id, true]),
      ),
    );
  }, [pagedTableData]);

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
            bgcolor: 'action.hover',
          }}
        >
          <OffersNestedTable
            offers={row.original.offers}
            companyId={companyId}
            selectionEnabled={selectionEnabled}
            materialRequestId={requestId}
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
      ) : isMobile ? (
        <Stack spacing={1}>
          <ComparisonMobileCards
            rows={pagedTableData}
            companyId={companyId}
            selectionEnabled={selectionEnabled}
            materialRequestId={requestId}
          />
          <TablePagination
            component="div"
            count={tableData.length}
            page={pagination.pageIndex}
            onPageChange={(_event, nextPage) =>
              setPagination((current) => ({
                ...current,
                pageIndex: nextPage,
              }))
            }
            rowsPerPage={pagination.pageSize}
            rowsPerPageOptions={[PAGE_SIZE]}
            onRowsPerPageChange={() => undefined}
          />
        </Stack>
      ) : (
        <Box>
          <MaterialReactTable table={table} />
        </Box>
      )}
    </Stack>
  );
}
