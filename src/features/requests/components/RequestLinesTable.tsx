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
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
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
import { RequestLineFormDialog } from '@/features/requests/components/RequestLineFormDialog';

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
        size: 10,
        maxSize: 10,
        enableResizing: true,
      },
      {
        accessorKey: 'description',
        header: t('columns.description'),
      },
      {
        accessorKey: 'quantity',
        header: t('columns.quantity'),
        size: 20,
        maxSize: 20,
        enableResizing: true,
        muiTableHeadCellProps: {
          align: 'center',
        },
        muiTableBodyCellProps: {
          align: 'center',
        },
        Cell: ({ cell }) => <DecimalDisplay value={cell.getValue<string>()} />,
      },
      {
        accessorKey: 'unit',
        header: t('columns.unit'),
        size: 20,
        maxSize: 20,
        enableResizing: true,
        muiTableHeadCellProps: {
          align: 'center',
        },
        muiTableBodyCellProps: {
          align: 'center',
        },
        Cell: ({ cell }) => cell.getValue<string | null>() ?? '—',
      },
    ];

    if (editable) {
      baseColumns.push({
        id: 'actions',
        header: t('columns.actions'),
        size: 30,
        maxSize: 30,
        enableResizing: true,
        muiTableHeadCellProps: {
          align: 'right',
        },
        muiTableBodyCellProps: {
          align: 'right',
        },
        Cell: ({ row }) => (
          <PermissionGate permission="manageRequests">
            <Stack direction="row" spacing={0.5}>
              <Tooltip title={t('actions.editLine')}>
                <IconButton
                  size="small"
                  aria-label={t('actions.editLine')}
                  onClick={() => {
                    setEditingLine(row.original);
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
                  onClick={() => setLineToDelete(row.original)}
                >
                  <DeleteOutlineIcon fontSize="small" />
                </IconButton>
              </Tooltip>
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
    layoutMode: 'grid',
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
      <Typography variant="h6">{t('linesTitle')}</Typography>

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
      

      {editable ? (
        <Stack direction="row" justifyContent="end" alignItems="center">
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
        </Stack>
      ) : null}

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
