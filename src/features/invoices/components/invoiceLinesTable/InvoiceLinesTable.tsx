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
import type { MRT_ColumnDef, MRT_PaginationState } from 'material-react-table';
import { useTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';

import type { BillableLine } from '@/api/generated/models/billableLine';
import type { InvoiceLine } from '@/api/generated/models/invoiceLine';
import { useDeleteInvoiceLineMutation } from '@/api/endpoints/invoicesApi';
import { ApiErrorAlert } from '@/components/ApiErrorAlert';
import { PaginatedTable } from '@/components/PaginatedTable';
import { PermissionGate } from '@/components/PermissionGate';
import { InvoiceLineFormDialog } from '@/features/invoices/components/invoiceLinesTable/InvoiceLineFormDialog';
import { createInvoiceLineBaseColumns } from '@/features/invoices/lib/invoiceLineTableColumns';

const PAGE_SIZE = 20;

interface InvoiceLinesTableProps {
  companyId: string;
  invoiceId: string;
  requestIds?: string[];
  quoteIds?: string[];
  currency: string;
  totalAmount: string;
  lines: InvoiceLine[];
  billableLines: BillableLine[];
  editable: boolean;
}

export function InvoiceLinesTable({
  companyId,
  invoiceId,
  requestIds,
  quoteIds,
  currency,
  totalAmount,
  lines,
  billableLines,
  editable,
}: InvoiceLinesTableProps) {
  const { t } = useTranslation('invoices');
  const { enqueueSnackbar } = useSnackbar();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingLine, setEditingLine] = useState<InvoiceLine | null>(null);
  const [lineToDelete, setLineToDelete] = useState<InvoiceLine | null>(null);
  const [pagination, setPagination] = useState<MRT_PaginationState>({
    pageIndex: 0,
    pageSize: PAGE_SIZE,
  });

  const [deleteLine, deleteState] = useDeleteInvoiceLineMutation();

  const existingSelectionLineIds = lines.map(
    (line) => line.selectionLine?.id ?? '',
  );
  const hasBillableLines = billableLines.some(
    (item) => !existingSelectionLineIds.includes(item.selectionLineId),
  );

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

  const columns = useMemo<MRT_ColumnDef<InvoiceLine>[]>(
    () =>
      createInvoiceLineBaseColumns(t, {
        currency,
        totalAmount,
        renderActionExtraItems: editable
          ? (line) => (
              <PermissionGate permission="manageInvoices">
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
      }),
    [currency, editable, t, totalAmount],
  );

  async function handleDeleteConfirm() {
    if (!lineToDelete) {
      return;
    }

    await deleteLine({
      companyId,
      invoiceId,
      lineId: lineToDelete.id,
      requestIds,
      quoteIds,
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
                <PermissionGate permission="manageInvoices">
                  <Button
                    variant="outlined"
                    startIcon={<AddIcon />}
                    disabled={!hasBillableLines}
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

      <InvoiceLineFormDialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setEditingLine(null);
        }}
        companyId={companyId}
        invoiceId={invoiceId}
        requestIds={requestIds}
        quoteIds={quoteIds}
        billableLines={billableLines}
        existingSelectionLineIds={existingSelectionLineIds}
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
