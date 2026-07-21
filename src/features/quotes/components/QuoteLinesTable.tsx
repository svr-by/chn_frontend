import { useMemo, useState } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Typography,
} from '@mui/material';
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
  const [lineToDelete, setLineToDelete] = useState<QuoteLine | null>(null);

  const [deleteLine, deleteState] = useDeleteQuoteLineMutation();

  const existingLineIds = lines.map((line) => line.requestLineId);
  const hasAvailableRequestLines = requestLines.some(
    (requestLine) => !existingLineIds.includes(requestLine.id),
  );

  const columns = useMemo<MRT_ColumnDef<QuoteLine>[]>(() => {
    const baseColumns: MRT_ColumnDef<QuoteLine>[] = [
      {
        accessorKey: 'lineNumber',
        header: t('columns.lineNumber'),
        size: 60,
      },
      {
        id: 'requestLine',
        header: t('columns.requestLine'),
        Cell: ({ row }) => row.original.requestLine.description,
      },
      {
        accessorKey: 'quantity',
        header: t('columns.quantity'),
        Cell: ({ cell }) => <DecimalDisplay value={cell.getValue<string>()} />,
      },
      {
        accessorKey: 'unitPrice',
        header: t('columns.unitPrice'),
        Cell: ({ cell }) => <DecimalDisplay value={cell.getValue<string>()} />,
      },
      {
        accessorKey: 'lineTotal',
        header: t('columns.lineTotal'),
        Cell: ({ cell }) => <DecimalDisplay value={cell.getValue<string>()} />,
      },
      {
        id: 'lineage',
        header: t('columns.lineage'),
        Cell: ({ row }) => <LineageLink lineageId={row.original.lineageId} />,
      },
      {
        accessorKey: 'notes',
        header: t('columns.notes'),
        Cell: ({ cell }) => cell.getValue<string | null>() ?? '—',
      },
    ];

    if (editable) {
      baseColumns.push({
        id: 'actions',
        header: t('columns.actions'),
        Cell: ({ row }) => (
          <PermissionGate permission="manageQuotes">
            <Stack direction="row" spacing={1}>
              <Button
                size="small"
                onClick={() => {
                  setEditingLine(row.original);
                  setDialogOpen(true);
                }}
              >
                {t('actions.editLine')}
              </Button>
              <Button
                size="small"
                color="error"
                onClick={() => setLineToDelete(row.original)}
              >
                {t('actions.deleteLine')}
              </Button>
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

  return (
    <Stack spacing={2}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="h6">{t('linesTitle')}</Typography>
        {editable && hasAvailableRequestLines ? (
          <PermissionGate permission="manageQuotes">
            <Button
              variant="outlined"
              onClick={() => {
                setEditingLine(null);
                setDialogOpen(true);
              }}
            >
              {t('actions.addLine')}
            </Button>
          </PermissionGate>
        ) : null}
      </Stack>

      <ApiErrorAlert error={deleteState.error} />

      {lines.length === 0 ? (
        <Typography color="text.secondary">{t('empty.lines')}</Typography>
      ) : (
        <SimpleTable
          columns={columns}
          data={lines}
          options={{ getRowId: (row) => row.id }}
        />
      )}

      <QuoteLineFormDialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setEditingLine(null);
        }}
        companyId={companyId}
        quoteId={quoteId}
        materialRequestId={materialRequestId}
        requestLines={requestLines}
        existingLineIds={existingLineIds}
        line={editingLine}
        onSuccess={() =>
          enqueueSnackbar(
            editingLine ? t('toast.lineUpdated') : t('toast.lineAdded'),
            { variant: 'success' },
          )
        }
      />

      <Dialog open={Boolean(lineToDelete)} onClose={() => setLineToDelete(null)}>
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
            onClick={handleDeleteConfirm}
            disabled={deleteState.isLoading}
          >
            {t('actions.deleteLine')}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
