import { useEffect, useMemo, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Link,
  Stack,
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
} from 'material-react-table';
import { useTranslation } from 'react-i18next';

import { useGetQuoteComparisonQuery } from '@/api/endpoints/requestsApi';
import { ApiErrorAlert } from '@/components/ApiErrorAlert';
import { DecimalDisplay } from '@/components/DecimalDisplay';
import { LineRowActionsMenu } from '@/components/LineRowActionsMenu';
import {
  buildQuoteComparisonRows,
  comparisonHasOffers,
  type QuoteComparisonLineRow,
  type QuoteComparisonOfferRow,
} from '@/features/quotes/lib/buildQuoteComparisonRows';
import { QuoteLineSelectionCell } from '@/features/quotes/components/quoteLineSelection/QuoteLineSelectionCell';
import { useAppMaterialReactTable } from '@/hooks/useAppMaterialReactTable';
import {
  MRT_NARROW_ACTIONS_SIZE,
  MRT_NARROW_LINE_NUMBER_SIZE,
  mrtFixedSizeColumnProps,
} from '@/lib/mrtNarrowColumns';

interface OfferSelectionProps {
  companyId: string;
  selectionEnabled: boolean;
  selectionMap: Map<string, string>;
  materialRequestId: string;
}

function resolveSelectedQuantity(
  offer: QuoteComparisonOfferRow['offer'],
  selectionMap: Map<string, string>,
): string | null {
  return (
    selectionMap.get(offer.quoteLineId) ?? offer.selectedQuantity ?? null
  );
}

function hasSelectedQuantity(
  offer: QuoteComparisonOfferRow['offer'],
  selectionMap: Map<string, string>,
): boolean {
  return resolveSelectedQuantity(offer, selectionMap) != null;
}

function lineHasSelectedQuantity(
  line: QuoteComparisonLineRow,
  selectionMap: Map<string, string>,
): boolean {
  return line.offers.some((offerRow) =>
    hasSelectedQuantity(offerRow.offer, selectionMap),
  );
}

function formatQuoteDate(value: string): string {
  return new Date(value).toLocaleDateString();
}

function OffersNestedTable({
  offers,
  companyId,
  selectionEnabled,
  selectionMap,
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
          <>
            <DecimalDisplay value={row.original.offer.unitPrice} />{' '}
            {row.original.offer.currency}
          </>
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
          <>
            <DecimalDisplay value={row.original.offer.lineTotal} />{' '}
            {row.original.offer.currency}
          </>
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
            selectedQuantity={resolveSelectedQuantity(
              row.original.offer,
              selectionMap,
            )}
            materialRequestId={materialRequestId}
            disabled={!selectionEnabled}
          />
        ),
      },
    ],
    [companyId, materialRequestId, selectionEnabled, selectionMap, t],
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
      const isSelected = hasSelectedQuantity(row.original.offer, selectionMap);
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
      const isSelected = hasSelectedQuantity(row.original.offer, selectionMap);
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
  selectionMap,
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
        <DecimalDisplay value={offer.unitPrice} /> {offer.currency}
      </Typography>
      <Typography variant="body2">
        {t('comparison.columns.offerQuantity')}:{' '}
        <DecimalDisplay value={offer.quantity} />
      </Typography>
      <Typography variant="body2">
        {t('comparison.columns.total')}:{' '}
        <DecimalDisplay value={offer.lineTotal} /> {offer.currency}
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
        selectedQuantity={resolveSelectedQuantity(offer, selectionMap)}
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
  selectionMap,
  materialRequestId,
}: { rows: QuoteComparisonLineRow[] } & OfferSelectionProps) {
  const { t } = useTranslation('quotes');

  return (
    <Stack spacing={1}>
      {rows.map((lineRow) => {
        const hasLineOffers = lineRow.offers.length > 0;
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
              <DecimalDisplay value={lineRow.requestLine.quantity} />{' '}
              {lineRow.requestLine.unit ?? '—'}
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
              lineHasSelectedQuantity(lineRow, selectionMap)
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
                  const isSelected = hasSelectedQuantity(
                    offerRow.offer,
                    selectionMap,
                  );
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
                          selectionMap={selectionMap}
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
  selectionEnabled?: boolean;
  selectionMap?: Map<string, string>;
}

export function QuoteComparisonMatrix({
  companyId,
  requestId,
  selectionEnabled = false,
  selectionMap = new Map(),
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

  const tableData = useMemo(() => buildQuoteComparisonRows(lines), [lines]);

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
          <>
            <DecimalDisplay value={row.original.requestLine.quantity} />{' '}
            {row.original.requestLine.unit ?? '—'}
          </>
        ),
      },
    ],
    [t],
  );

  const [expanded, setExpanded] = useState<MRT_ExpandedState>({});

  useEffect(() => {
    setExpanded(
      Object.fromEntries(
        tableData
          .filter((row) => row.offers.length > 0)
          .map((row) => [row.id, true]),
      ),
    );
  }, [tableData]);

  const table = useAppMaterialReactTable({
    columns,
    data: tableData,
    getRowId: (row) => row.id,
    layoutMode: 'grid',
    enableColumnResizing: false,
    enablePagination: false,
    enableBottomToolbar: false,
    enableExpandAll: true,
    getRowCanExpand: (row) => row.original.offers.length > 0,
    state: { expanded },
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
      const isSelected = lineHasSelectedQuantity(row.original, selectionMap);
      return {
        sx: {
          bgcolor: isSelected
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
            selectionMap={selectionMap}
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
        <ComparisonMobileCards
          rows={tableData}
          companyId={companyId}
          selectionEnabled={selectionEnabled}
          selectionMap={selectionMap}
          materialRequestId={requestId}
        />
      ) : (
        <Box>
          <MaterialReactTable table={table} />
        </Box>
      )}
    </Stack>
  );
}
