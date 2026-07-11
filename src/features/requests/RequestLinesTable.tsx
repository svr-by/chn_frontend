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

import type { RequestLine } from '@/api/generated/models/requestLine';
import { useDeleteRequestLineMutation } from '@/api/endpoints/requestsApi';
import { ApiErrorAlert } from '@/components/ApiErrorAlert';
import { DecimalDisplay } from '@/components/DecimalDisplay';
import { PermissionGate } from '@/components/PermissionGate';
import { RequestLineFormDialog } from '@/features/requests/RequestLineFormDialog';

interface RequestLinesTableProps {
  companyId: string;
  requestId: string;
  lines: RequestLine[];
  editable: boolean;
}

export function RequestLinesTable({
  companyId,
  requestId,
  lines,
  editable,
}: RequestLinesTableProps) {
  const { t } = useTranslation('requests');
  const { enqueueSnackbar } = useSnackbar();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingLine, setEditingLine] = useState<RequestLine | null>(null);
  const [lineToDelete, setLineToDelete] = useState<RequestLine | null>(null);

  const [deleteLine, deleteState] = useDeleteRequestLineMutation();

  const columns = useMemo<MRT_ColumnDef<RequestLine>[]>(() => {
    const baseColumns: MRT_ColumnDef<RequestLine>[] = [
      {
        accessorKey: 'lineNumber',
        header: t('columns.lineNumber'),
        size: 60,
      },
      {
        accessorKey: 'description',
        header: t('columns.description'),
      },
      {
        id: 'product',
        header: t('columns.product'),
        Cell: ({ row }) => {
          const product = row.original.product;
          if (!product) {
            return '—';
          }
          return product.sku
            ? `${product.name} (${product.sku})`
            : product.name;
        },
      },
      {
        accessorKey: 'quantity',
        header: t('columns.quantity'),
        Cell: ({ cell }) => <DecimalDisplay value={cell.getValue<string>()} />,
      },
      {
        accessorKey: 'unit',
        header: t('columns.unit'),
        Cell: ({ cell }) => cell.getValue<string | null>() ?? '—',
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
          <PermissionGate permission="manageRequests">
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

  const table = useMaterialReactTable({
    columns,
    data: lines,
    enableColumnActions: false,
    enableColumnFilters: false,
    enableSorting: false,
    enableTopToolbar: false,
    enableBottomToolbar: false,
    getRowId: (row) => row.id,
    muiTablePaperProps: {
      elevation: 0,
      sx: { border: 1, borderColor: 'divider' },
    },
  });

  async function handleDeleteConfirm() {
    if (!lineToDelete) {
      return;
    }

    await deleteLine({
      companyId,
      requestId,
      lineId: lineToDelete.id,
    }).unwrap();

    enqueueSnackbar(t('toast.lineDeleted'), { variant: 'success' });
    setLineToDelete(null);
  }

  return (
    <Stack spacing={2}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="h6">{t('linesTitle')}</Typography>
        {editable ? (
          <PermissionGate permission="manageRequests">
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
        <MaterialReactTable table={table} />
      )}

      <RequestLineFormDialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setEditingLine(null);
        }}
        companyId={companyId}
        requestId={requestId}
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
