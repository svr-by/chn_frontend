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
import {
  MaterialReactTable,
  useMaterialReactTable,
  type MRT_ColumnDef,
} from 'material-react-table';
import { useTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';

import type { BillableLine } from '@/api/generated/models/billableLine';
import type { InvoiceLine } from '@/api/generated/models/invoiceLine';
import { useDeleteInvoiceLineMutation } from '@/api/endpoints/invoicesApi';
import { ApiErrorAlert } from '@/components/ApiErrorAlert';
import { DecimalDisplay } from '@/components/DecimalDisplay';
import { LineageLink } from '@/components/LineageLink';
import { PermissionGate } from '@/components/PermissionGate';
import { InvoiceLineFormDialog } from '@/features/invoices/components/InvoiceLineFormDialog';

interface InvoiceLinesTableProps {
  companyId: string;
  invoiceId: string;
  materialRequestId: string;
  purchaseSelectionId: string;
  currency: string;
  lines: InvoiceLine[];
  billableLines: BillableLine[];
  editable: boolean;
}

export function InvoiceLinesTable({
  companyId,
  invoiceId,
  materialRequestId,
  purchaseSelectionId,
  currency,
  lines,
  billableLines,
  editable,
}: InvoiceLinesTableProps) {
  const { t } = useTranslation('invoices');
  const { enqueueSnackbar } = useSnackbar();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingLine, setEditingLine] = useState<InvoiceLine | null>(null);
  const [lineToDelete, setLineToDelete] = useState<InvoiceLine | null>(null);

  const [deleteLine, deleteState] = useDeleteInvoiceLineMutation();

  const existingSelectionLineIds = lines.map(
    (line) => line.selectionLine?.id ?? '',
  );
  const hasBillableLines = billableLines.some(
    (item) => !existingSelectionLineIds.includes(item.selectionLineId),
  );

  const columns = useMemo<MRT_ColumnDef<InvoiceLine>[]>(() => {
    const baseColumns: MRT_ColumnDef<InvoiceLine>[] = [
      {
        accessorKey: 'lineNumber',
        header: t('columns.lineNumber'),
        size: 60,
      },
      {
        id: 'requestLine',
        header: t('columns.requestLine'),
        Cell: ({ row }) => row.original.requestLine?.description ?? '—',
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
        Cell: ({ cell }) => (
          <>
            <DecimalDisplay value={cell.getValue<string>()} /> {currency}
          </>
        ),
      },
      {
        id: 'lineage',
        header: t('columns.lineage'),
        Cell: ({ row }) => <LineageLink lineageId={row.original.lineageId} />,
      },
      {
        accessorKey: 'notes',
        header: t('columns.notes'),
        Cell: ({ cell }) => cell.getValue<string>() ?? '—',
      },
    ];

    if (editable) {
      baseColumns.push({
        id: 'actions',
        header: t('columns.actions'),
        Cell: ({ row }) => (
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
        ),
      });
    }

    return baseColumns;
  }, [currency, editable, t]);

  const table = useMaterialReactTable({
    columns,
    data: lines,
    enablePagination: false,
    enableColumnActions: false,
    enableSorting: false,
    enableTopToolbar: false,
    enableBottomToolbar: false,
  });

  async function handleDelete() {
    if (!lineToDelete) {
      return;
    }

    await deleteLine({
      companyId,
      invoiceId,
      lineId: lineToDelete.id,
      materialRequestId,
      purchaseSelectionId,
    }).unwrap();

    enqueueSnackbar(t('toast.lineDeleted'), { variant: 'success' });
    setLineToDelete(null);
  }

  return (
    <Stack spacing={2}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="h6">{t('linesTitle')}</Typography>
        {editable ? (
          <PermissionGate permission="manageInvoices">
            <Button
              variant="outlined"
              onClick={() => {
                setEditingLine(null);
                setDialogOpen(true);
              }}
              disabled={!hasBillableLines}
            >
              {t('actions.addLine')}
            </Button>
          </PermissionGate>
        ) : null}
      </Stack>

      {lines.length === 0 ? (
        <Typography color="text.secondary">{t('empty.lines')}</Typography>
      ) : (
        <MaterialReactTable table={table} />
      )}

      <InvoiceLineFormDialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setEditingLine(null);
        }}
        companyId={companyId}
        invoiceId={invoiceId}
        materialRequestId={materialRequestId}
        purchaseSelectionId={purchaseSelectionId}
        billableLines={billableLines}
        existingSelectionLineIds={existingSelectionLineIds}
        line={editingLine}
      />

      <Dialog open={Boolean(lineToDelete)} onClose={() => setLineToDelete(null)}>
        <DialogTitle>{t('confirm.deleteLineTitle')}</DialogTitle>
        <DialogContent>
          <ApiErrorAlert error={deleteState.error} />
          <Typography>{t('confirm.deleteLineMessage')}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLineToDelete(null)}>
            {t('actions.dismiss')}
          </Button>
          <Button
            color="error"
            variant="contained"
            onClick={handleDelete}
            disabled={deleteState.isLoading}
          >
            {t('actions.deleteLine')}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
