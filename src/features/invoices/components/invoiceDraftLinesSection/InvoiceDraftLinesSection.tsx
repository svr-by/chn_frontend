import { useEffect, useMemo, useState } from 'react';
import { Button, IconButton, Stack, Tooltip, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import type { MRT_ColumnDef, MRT_PaginationState } from 'material-react-table';
import { useTranslation } from 'react-i18next';

import { DecimalDisplay } from '@/components/DecimalDisplay';
import { PaginatedTable } from '@/components/PaginatedTable';
import { RequestLineCancelledBadge } from '@/components/RequestLineCancelledBadge';
import { InvoiceDraftLineDialog } from '@/features/invoices/components/InvoiceDraftLineDialog';
import type { DraftInvoiceLine } from '@/features/invoices/lib/draftInvoiceLine';
import { parseDecimal } from '@/lib/decimal';
import {
  MRT_NARROW_ACTIONS_SIZE,
  MRT_NARROW_LINE_NUMBER_SIZE,
  mrtFixedSizeColumnProps,
} from '@/lib/mrtNarrowColumns';

const PAGE_SIZE = 20;

type NumberedDraftLine = DraftInvoiceLine & { lineNumber: number };

interface InvoiceDraftLinesSectionProps {
  companyId: string;
  currency: string;
  lines: DraftInvoiceLine[];
  onChange: (lines: DraftInvoiceLine[]) => void;
  onAddLine: (line: DraftInvoiceLine) => void;
  existingSelectionLineIds: string[];
  initialQuoteId?: string | null;
  errorMessage?: string;
}

export function InvoiceDraftLinesSection({
  companyId,
  currency,
  lines,
  onChange,
  onAddLine,
  existingSelectionLineIds,
  initialQuoteId,
  errorMessage,
}: InvoiceDraftLinesSectionProps) {
  const { t } = useTranslation('invoices');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [pagination, setPagination] = useState<MRT_PaginationState>({
    pageIndex: 0,
    pageSize: PAGE_SIZE,
  });

  useEffect(() => {
    const maxPageIndex = Math.max(
      0,
      Math.ceil(lines.length / pagination.pageSize) - 1,
    );
    if (pagination.pageIndex > maxPageIndex) {
      setPagination((current) => ({ ...current, pageIndex: maxPageIndex }));
    }
  }, [lines.length, pagination.pageIndex, pagination.pageSize]);

  const numberedLines = useMemo<NumberedDraftLine[]>(
    () => lines.map((line, index) => ({ ...line, lineNumber: index + 1 })),
    [lines],
  );

  const pagedLines = useMemo(
    () =>
      numberedLines.slice(
        pagination.pageIndex * pagination.pageSize,
        pagination.pageIndex * pagination.pageSize + pagination.pageSize,
      ),
    [numberedLines, pagination.pageIndex, pagination.pageSize],
  );

  const totalAmount = useMemo(
    () =>
      lines
        .reduce(
          (sum, line) => sum.add(parseDecimal(line.lineTotal)),
          parseDecimal('0'),
        )
        .toFixed(),
    [lines],
  );

  const columns = useMemo<MRT_ColumnDef<NumberedDraftLine>[]>(
    () => [
      {
        id: 'actions',
        header: '',
        ...mrtFixedSizeColumnProps(MRT_NARROW_ACTIONS_SIZE),
        Cell: ({ row }) => (
          <Tooltip title={t('actions.deleteLine')}>
            <IconButton
              size="small"
              color="error"
              aria-label={t('actions.deleteLine')}
              onClick={() =>
                onChange(
                  lines.filter(
                    (item) =>
                      item.selectionLineId !== row.original.selectionLineId,
                  ),
                )
              }
            >
              <DeleteOutlineIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        ),
      },
      {
        id: 'lineNumber',
        accessorKey: 'lineNumber',
        header: t('columns.lineNumber'),
        ...mrtFixedSizeColumnProps(MRT_NARROW_LINE_NUMBER_SIZE),
      },
      {
        id: 'requestLine',
        header: t('columns.requestLine'),
        grow: true,
        Cell: ({ row }) => (
          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
            <span>{row.original.description}</span>
            <RequestLineCancelledBadge cancelledAt={row.original.cancelledAt} />
          </Stack>
        ),
      },
      {
        id: 'notes',
        accessorKey: 'notes',
        header: t('columns.notes'),
        size: 120,
        grow: false,
        Cell: ({ row }) => row.original.notes ?? '—',
      },
      {
        id: 'quantity',
        accessorKey: 'quantity',
        header: t('columns.quantity'),
        size: 120,
        grow: false,
        muiTableBodyCellProps: { align: 'right' },
        muiTableHeadCellProps: { align: 'right' },
        Cell: ({ row }) => (
          <DecimalDisplay
            value={row.original.quantity}
            suffix={row.original.unit ?? ''}
          />
        ),
      },
      {
        id: 'unitPrice',
        accessorKey: 'unitPrice',
        header: t('columns.unitPrice'),
        size: 120,
        grow: false,
        muiTableBodyCellProps: { align: 'right' },
        muiTableHeadCellProps: { align: 'right' },
        muiTableFooterCellProps: { align: 'right' },
        Cell: ({ row }) => (
          <DecimalDisplay
            value={row.original.unitPrice}
            suffix={currency}
            groupDigits
          />
        ),
      },
      {
        id: 'lineTotal',
        accessorKey: 'lineTotal',
        header: t('columns.lineTotal'),
        size: 140,
        grow: false,
        muiTableBodyCellProps: { align: 'right' },
        muiTableHeadCellProps: { align: 'right' },
        muiTableFooterCellProps: { align: 'right' },
        Cell: ({ row }) => (
          <DecimalDisplay
            value={row.original.lineTotal}
            suffix={currency}
            groupDigits
          />
        ),
        Footer: () => (currency && lines.length > 0) ? (
          <DecimalDisplay
            value={totalAmount}
            suffix={currency}
            groupDigits
            fontWeight={600}
          />
        ) : undefined,
      },
    ],
    [currency, lines, onChange, t, totalAmount],
  );

  return (
    <Stack spacing={2} sx={{ width: '100%', mb: 3 }}>
      {errorMessage ? (
        <Typography color="error" variant="body2">
          {errorMessage}
        </Typography>
      ) : null}

      <PaginatedTable
        columns={columns}
        data={pagedLines}
        rowCount={lines.length}
        pagination={pagination}
        onPaginationChange={setPagination}
        getRowId={(row) => row.selectionLineId}
        layoutMode="grid"
        renderBottomToolbarCustomActions={() => (
          <Button
            type="button"
            variant="outlined"
            disabled={!currency || lines.length >= 100}
            startIcon={<AddIcon />}
            onClick={() => setDialogOpen(true)}
          >
            {t('actions.addLine')}
          </Button>
        )}
      />

      <InvoiceDraftLineDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        companyId={companyId}
        currency={currency}
        existingSelectionLineIds={existingSelectionLineIds}
        initialQuoteId={initialQuoteId}
        onAdd={(line) => {
          onAddLine(line);
          setDialogOpen(false);
        }}
      />
    </Stack>
  );
}
