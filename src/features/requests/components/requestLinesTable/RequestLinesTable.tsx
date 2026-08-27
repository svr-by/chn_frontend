import { useEffect, useMemo, useState } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Stack,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import NotesOutlinedIcon from '@mui/icons-material/NotesOutlined';
import type { MRT_ColumnDef, MRT_PaginationState } from 'material-react-table';
import { useTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';

import type { RequestLine } from '@/api/generated/models/requestLine';
import { useDeleteRequestLineMutation } from '@/api/endpoints/requestsApi';
import { ApiErrorAlert } from '@/components/feedback/apiErrorAlert/ApiErrorAlert';
import { PaginatedTable } from '@/components/tables/paginatedTable/PaginatedTable';
import { PermissionGate } from '@/components/auth/permissionGate/PermissionGate';
import { ClampedTextDialog } from '@/components/dataDisplay/clampedTextDialog/ClampedTextDialog';
import { RequestLineFormDialog } from '@/features/requests/components/requestLineFormDialog/RequestLineFormDialog';
import { createRequestLineBaseColumns } from '@/features/requests/lib/requestLineTableColumns';
import { DEFAULT_PAGE_SIZE } from '@/lib/pagination';


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
    pageSize: DEFAULT_PAGE_SIZE,
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

  const columns = useMemo<MRT_ColumnDef<RequestLine>[]>(
    () => {
      const baseColumns = createRequestLineBaseColumns(t, {
        renderActionExtraItems: editable
          ? (line) => (
              <PermissionGate permission="manageRequests">
                <MenuItem
                  onClick={() => {
                    setEditingLine(line);
                    setDialogOpen(true);
                  }}
                >
                  <ListItemIcon>
                    <EditOutlinedIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>{t('actions.editLine')}</ListItemText>
                </MenuItem>
                <MenuItem onClick={() => setLineToDelete(line)}>
                  <ListItemIcon>
                    <DeleteOutlineIcon fontSize="small" color="error" />
                  </ListItemIcon>
                  <ListItemText>{t('actions.deleteLine')}</ListItemText>
                </MenuItem>
              </PermissionGate>
            )
          : undefined,
      });

      const notesColumn: MRT_ColumnDef<RequestLine> = {
        id: 'notes',
        accessorKey: 'notes',
        header: t('columns.notes'),
        size: 220,
        grow: false,
        Cell: ({ row }) => (
          <ClampedTextDialog
            text={row.original.notes}
            title={t('form.notes')}
            closeLabel={t('actions.cancel')}
            previewLines={1}
            icon={
              <NotesOutlinedIcon
                fontSize="small"
                color="action"
                sx={{ mt: 0.5, flex: '0 0 auto' }}
              />
            }
          />
        ),
      };

      // Keep `notes` between `description` and `quantity`.
      return [
        ...baseColumns.slice(0, 3),
        notesColumn,
        ...baseColumns.slice(3),
      ];
    },
    [editable, t],
  );

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
      <ApiErrorAlert error={deleteState.error} />

      <PaginatedTable
        columns={columns}
        data={pagedLines}
        rowCount={lines.length}
        pagination={pagination}
        onPaginationChange={setPagination}
        getRowId={(row) => row.id}
        layoutMode="grid"
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
