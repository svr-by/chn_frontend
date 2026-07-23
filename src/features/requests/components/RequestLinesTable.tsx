import { useEffect, useMemo, useState } from 'react';
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
import AddIcon from '@mui/icons-material/Add';
import type { MRT_ColumnDef, MRT_PaginationState } from 'material-react-table';
import { useTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';

import type { RequestLine } from '@/api/generated/models/requestLine';
import { useDeleteRequestLineMutation } from '@/api/endpoints/requestsApi';
import { ApiErrorAlert } from '@/components/ApiErrorAlert';
import { DecimalDisplay } from '@/components/DecimalDisplay';
import { PaginatedTable } from '@/components/PaginatedTable';
import { PermissionGate } from '@/components/PermissionGate';
import { RequestLineFormDialog } from '@/features/requests/components/RequestLineFormDialog';

const PAGE_SIZE = 20;

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
  const [pagination, setPagination] = useState<MRT_PaginationState>({
    pageIndex: 0,
    pageSize: PAGE_SIZE,
  });

  const [deleteLine, deleteState] = useDeleteRequestLineMutation();

  useEffect(() => {
    const maxPageIndex = Math.max(
      0,
      Math.ceil(lines.length / pagination.pageSize) - 1,
    );
    if (pagination.pageIndex > maxPageIndex) {
      setPagination((current) => ({ ...current, pageIndex: maxPageIndex }));
    }
  }, [lines.length, pagination.pageIndex, pagination.pageSize]);

  const pagedLines = useMemo(
    () =>
      lines.slice(
        pagination.pageIndex * pagination.pageSize,
        pagination.pageIndex * pagination.pageSize + pagination.pageSize,
      ),
    [lines, pagination.pageIndex, pagination.pageSize],
  );

  const columns = useMemo<MRT_ColumnDef<RequestLine>[]>(() => {
    const baseColumns: MRT_ColumnDef<RequestLine>[] = [
      {
        accessorKey: 'lineNumber',
        header: t('columns.lineNumber'),
        size: 10,
        maxSize: 10,
        // enableResizing: true,
        muiTableHeadCellProps: { sx: { width: 20 } },
        muiTableBodyCellProps: { sx: { width: 20 } },
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
        size: 20,
        maxSize: 20,
        enableResizing: true,
        muiTableHeadCellProps: {
          align: 'right',
        },
        muiTableBodyCellProps: {
          align: 'right',
        },
        Cell: ({ row }) => (
          <PermissionGate permission="manageRequests">
            <Stack
              direction="row"
              spacing={0.5}
              sx={{ justifyContent: 'flex-end' }}
            >
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

      <PaginatedTable
        columns={columns}
        data={pagedLines}
        rowCount={lines.length}
        pagination={pagination}
        onPaginationChange={setPagination}
        getRowId={(row) => row.id}
        renderBottomToolbarCustomActions={
          editable
            ? () => (
                <PermissionGate permission="manageRequests">
                  <Button
                    variant="outlined"
                    startIcon={<AddIcon />}
                    onClick={() => {
                      setEditingLine(null);
                      setDialogOpen(true);
                    }}
                  >
                    {t('actions.addLine')}
                  </Button>
                </PermissionGate>
              )
            : undefined
        }
      />

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
