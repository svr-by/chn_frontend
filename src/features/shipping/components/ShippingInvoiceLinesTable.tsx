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

import type { ShippableLine } from '@/api/generated/models/shippableLine';
import type { ShippingLine } from '@/api/generated/models/shippingLine';
import { useDeleteShippingLineMutation } from '@/api/endpoints/shippingInvoicesApi';
import { ApiErrorAlert } from '@/components/ApiErrorAlert';
import { DecimalDisplay } from '@/components/DecimalDisplay';
import { LineageLink } from '@/components/LineageLink';
import { PermissionGate } from '@/components/PermissionGate';
import { SimpleTable } from '@/components/SimpleTable';
import { ShippingInvoiceLineFormDialog } from '@/features/shipping/components/ShippingInvoiceLineFormDialog';

interface ShippingInvoiceLinesTableProps {
  companyId: string;
  shippingInvoiceId: string;
  supplierInvoiceId: string;
  lines: ShippingLine[];
  shippableLines: ShippableLine[];
  editable: boolean;
}

export function ShippingInvoiceLinesTable({
  companyId,
  shippingInvoiceId,
  supplierInvoiceId,
  lines,
  shippableLines,
  editable,
}: ShippingInvoiceLinesTableProps) {
  const { t } = useTranslation('shipping');
  const { enqueueSnackbar } = useSnackbar();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingLine, setEditingLine] = useState<ShippingLine | null>(null);
  const [lineToDelete, setLineToDelete] = useState<ShippingLine | null>(null);

  const [deleteLine, deleteState] = useDeleteShippingLineMutation();

  const existingInvoiceLineIds = lines.map(
    (shippingLine) => shippingLine.invoiceLine?.id ?? '',
  );
  const hasShippableLines = shippableLines.some(
    (item) =>
      item.remainingQuantity !== '0' &&
      item.remainingQuantity !== '0.0000' &&
      !existingInvoiceLineIds.includes(item.invoiceLineId),
  );

  const columns = useMemo<MRT_ColumnDef<ShippingLine>[]>(() => {
    const baseColumns: MRT_ColumnDef<ShippingLine>[] = [
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
  }, [editable, t]);

  async function handleDelete() {
    if (!lineToDelete) {
      return;
    }

    await deleteLine({
      companyId,
      shippingInvoiceId,
      lineId: lineToDelete.id,
      supplierInvoiceId,
    }).unwrap();

    enqueueSnackbar(t('toast.lineDeleted'), { variant: 'success' });
    setLineToDelete(null);
  }

  return (
    <Stack spacing={2}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="h6">{t('linesTitle')}</Typography>
        {editable ? (
          <PermissionGate permission="manageShippingInvoices">
            <Button
              variant="outlined"
              onClick={() => {
                setEditingLine(null);
                setDialogOpen(true);
              }}
              disabled={!hasShippableLines}
            >
              {t('actions.addLine')}
            </Button>
          </PermissionGate>
        ) : null}
      </Stack>

      {lines.length === 0 ? (
        <Typography color="text.secondary">{t('empty.lines')}</Typography>
      ) : (
        <SimpleTable columns={columns} data={lines} />
      )}

      <ShippingInvoiceLineFormDialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setEditingLine(null);
        }}
        companyId={companyId}
        shippingInvoiceId={shippingInvoiceId}
        supplierInvoiceId={supplierInvoiceId}
        shippableLines={shippableLines}
        existingInvoiceLineIds={existingInvoiceLineIds}
        line={editingLine}
      />

      <Dialog
        open={Boolean(lineToDelete)}
        onClose={() => setLineToDelete(null)}
      >
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
