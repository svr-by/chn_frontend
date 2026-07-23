import { useMemo, useState } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import type { MRT_ColumnDef } from 'material-react-table';
import { useTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';

import type { QuoteLine } from '@/api/generated/models/quoteLine';
import type { RequestLine } from '@/api/generated/models/requestLine';
import { useDeleteQuoteLineMutation } from '@/api/endpoints/quotesApi';
import { ApiErrorAlert } from '@/components/ApiErrorAlert';
import { DecimalDisplay } from '@/components/DecimalDisplay';
import { LineageLink } from '@/components/LineageLink';
import { PermissionGate } from '@/components/PermissionGate';
import { SimpleTable } from '@/components/SimpleTable';
import { QuoteLineFormDialog } from '@/features/quotes/components/QuoteLineFormDialog';

type OfferRow = {
  id: string;
  lineNumber: number;
  description: string;
  requestedQuantity: string;
  unit: string | null;
  quoteLine: QuoteLine | null;
};

interface QuoteLinesTableProps {
  companyId: string;
  quoteId: string;
  materialRequestId: string;
  lines: QuoteLine[];
  requestLines: RequestLine[];
  editable: boolean;
}

export function QuoteLinesTable({
  companyId,
  quoteId,
  materialRequestId,
  lines,
  requestLines,
  editable,
}: QuoteLinesTableProps) {
  const { t } = useTranslation('quotes');
  const { enqueueSnackbar } = useSnackbar();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingLine, setEditingLine] = useState<QuoteLine | null>(null);
  const [initialRequestLineId, setInitialRequestLineId] = useState<
    string | null
  >(null);
  const [lineToDelete, setLineToDelete] = useState<QuoteLine | null>(null);

  const [deleteLine, deleteState] = useDeleteQuoteLineMutation();

  const existingLineIds = lines.map((line) => line.requestLineId);
  const hasAvailableRequestLines = requestLines.some(
    (requestLine) => !existingLineIds.includes(requestLine.id),
  );

  const rows = useMemo<OfferRow[]>(() => {
    if (requestLines.length > 0) {
      const quoteLineByRequestLineId = new Map(
        lines.map((line) => [line.requestLineId, line]),
      );

      return [...requestLines]
        .sort((a, b) => a.lineNumber - b.lineNumber)
        .map((requestLine) => ({
          id: requestLine.id,
          lineNumber: requestLine.lineNumber,
          description: requestLine.description,
          requestedQuantity: requestLine.quantity,
          unit: requestLine.unit,
          quoteLine: quoteLineByRequestLineId.get(requestLine.id) ?? null,
        }));
    }

    return lines.map((line) => ({
      id: line.id,
      lineNumber: line.lineNumber,
      description: line.requestLine.description,
      requestedQuantity: line.requestLine.quantity,
      unit: line.requestLine.unit,
      quoteLine: line,
    }));
  }, [lines, requestLines]);

  const columns = useMemo<MRT_ColumnDef<OfferRow>[]>(() => {
    const baseColumns: MRT_ColumnDef<OfferRow>[] = [
      {
        accessorKey: 'lineNumber',
        header: t('columns.lineNumber'),
        size: 60,
      },
      {
        accessorKey: 'description',
        header: t('columns.requestLine'),
      },
      {
        id: 'requestedQuantity',
        header: t('columns.quantity'),
        Cell: ({ row }) => (
          <>
            <DecimalDisplay value={row.original.requestedQuantity} />
            {row.original.unit ? ` ${row.original.unit}` : ''}
          </>
        ),
      },
      {
        id: 'unitPrice',
        header: t('columns.unitPrice'),
        Cell: ({ row }) =>
          row.original.quoteLine ? (
            <DecimalDisplay value={row.original.quoteLine.unitPrice} />
          ) : (
            '—'
          ),
      },
      {
        id: 'offerQuantity',
        header: t('columns.offerQuantity'),
        Cell: ({ row }) =>
          row.original.quoteLine ? (
            <DecimalDisplay value={row.original.quoteLine.quantity} />
          ) : (
            '—'
          ),
      },
      {
        id: 'lineTotal',
        header: t('columns.lineTotal'),
        Cell: ({ row }) =>
          row.original.quoteLine ? (
            <DecimalDisplay value={row.original.quoteLine.lineTotal} />
          ) : (
            '—'
          ),
      },
      {
        id: 'lineage',
        header: t('columns.lineage'),
        Cell: ({ row }) =>
          row.original.quoteLine ? (
            <LineageLink lineageId={row.original.quoteLine.lineageId} />
          ) : (
            '—'
          ),
      },
      {
        id: 'notes',
        header: t('columns.notes'),
        Cell: ({ row }) => row.original.quoteLine?.notes ?? '—',
      },
    ];

    if (editable) {
      baseColumns.push({
        id: 'actions',
        header: t('columns.actions'),
        size: 100,
        muiTableHeadCellProps: { align: 'right' },
        muiTableBodyCellProps: { align: 'right' },
        Cell: ({ row }) => (
          <PermissionGate permission="manageQuotes">
            <Stack
              direction="row"
              spacing={0.5}
              sx={{ justifyContent: 'flex-end' }}
            >
              {row.original.quoteLine ? (
                <>
                  <Tooltip title={t('actions.editLine')}>
                    <IconButton
                      size="small"
                      aria-label={t('actions.editLine')}
                      onClick={() => {
                        const quoteLine = row.original.quoteLine;
                        if (!quoteLine) {
                          return;
                        }
                        setEditingLine(quoteLine);
                        setInitialRequestLineId(null);
                        setDialogOpen(true);
                      }}
                    >
                      <EditOutlinedIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title={t('actions.deleteLine')}>
                    <IconButton
                      size="small"
                      color="error"
                      aria-label={t('actions.deleteLine')}
                      onClick={() => {
                        const quoteLine = row.original.quoteLine;
                        if (!quoteLine) {
                          return;
                        }
                        setLineToDelete(quoteLine);
                      }}
                    >
                      <DeleteOutlineIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </>
              ) : (
                <Tooltip title={t('actions.addOffer')}>
                  <IconButton
                    size="small"
                    color="primary"
                    aria-label={t('actions.addOffer')}
                    onClick={() => {
                      setEditingLine(null);
                      setInitialRequestLineId(row.original.id);
                      setDialogOpen(true);
                    }}
                  >
                    <AddIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
            </Stack>
          </PermissionGate>
        ),
      });
    }

    return baseColumns;
  }, [editable, t]);

  async function handleDeleteConfirm() {
    if (!lineToDelete) {
      return;
    }

    await deleteLine({
      companyId,
      quoteId,
      lineId: lineToDelete.id,
      materialRequestId,
    }).unwrap();

    enqueueSnackbar(t('toast.lineDeleted'), { variant: 'success' });
    setLineToDelete(null);
  }

  function closeDialog() {
    setDialogOpen(false);
    setEditingLine(null);
    setInitialRequestLineId(null);
  }

  return (
    <Stack spacing={2}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="h6">{t('linesTitle')}</Typography>
        {editable && hasAvailableRequestLines && requestLines.length === 0 ? (
          <PermissionGate permission="manageQuotes">
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={() => {
                setEditingLine(null);
                setInitialRequestLineId(null);
                setDialogOpen(true);
              }}
            >
              {t('actions.addLine')}
            </Button>
          </PermissionGate>
        ) : null}
      </Stack>

      <ApiErrorAlert error={deleteState.error} />

      {rows.length === 0 ? (
        <Typography color="text.secondary">{t('empty.lines')}</Typography>
      ) : (
        <SimpleTable
          columns={columns}
          data={rows}
          options={{ getRowId: (row) => row.id }}
        />
      )}

      <QuoteLineFormDialog
        open={dialogOpen}
        onClose={closeDialog}
        companyId={companyId}
        quoteId={quoteId}
        materialRequestId={materialRequestId}
        requestLines={requestLines}
        existingLineIds={existingLineIds}
        line={editingLine}
        initialRequestLineId={initialRequestLineId}
        onSuccess={() =>
          enqueueSnackbar(
            editingLine ? t('toast.lineUpdated') : t('toast.lineAdded'),
            { variant: 'success' },
          )
        }
      />

      <Dialog
        open={Boolean(lineToDelete)}
        onClose={() => setLineToDelete(null)}
      >
        <DialogTitle>{t('confirm.deleteLineTitle')}</DialogTitle>
        <DialogContent>
          <Typography>{t('confirm.deleteLineMessage')}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLineToDelete(null)}>
            {t('actions.cancel')}
          </Button>
          <Button
            color="error"
            variant="contained"
            onClick={() => void handleDeleteConfirm()}
            disabled={deleteState.isLoading}
          >
            {t('actions.deleteLine')}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
