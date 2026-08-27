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
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import type { MRT_ColumnDef, MRT_PaginationState } from 'material-react-table';
import { useTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';

import type { InvoiceLine } from '@/api/generated/models/invoiceLine';
import { useDeleteInvoiceLineMutation } from '@/api/endpoints/invoicesApi';
import { ResponsiveIconButton } from '@/components/actions/responsiveIconButton/ResponsiveIconButton';
import { ApiErrorAlert } from '@/components/feedback/apiErrorAlert/ApiErrorAlert';
import { PaginatedTable } from '@/components/tables/paginatedTable/PaginatedTable';
import { PermissionGate } from '@/components/auth/permissionGate/PermissionGate';
import { InvoiceDraftLineDialog } from '@/features/invoices/components/InvoiceDraftLineDialog';
import { InvoiceLinesCsvExportDialog } from '@/features/invoices/components/invoiceLinesCsv/InvoiceLinesCsvExportDialog';
import { InvoiceLineFormDialog } from '@/features/invoices/components/invoiceLinesTable/InvoiceLineFormDialog';
import { createInvoiceLineBaseColumns } from '@/features/invoices/lib/invoiceLineTableColumns';
import { parseDecimal } from '@/lib/decimal';

const PAGE_SIZE = 20;

interface InvoiceLinesTableProps {
  companyId: string;
  invoiceId: string;
  requestIds?: string[];
  quoteIds?: string[];
  buyerCompanyId?: string | null;
  currency: string;
  totalAmount: string;
  lines: InvoiceLine[];
  shippedQuantityByLineId?: Record<string, string>;
  editable: boolean;
}

export function InvoiceLinesTable({
  companyId,
  invoiceId,
  requestIds,
  quoteIds,
  buyerCompanyId,
  currency,
  totalAmount,
  lines,
  shippedQuantityByLineId = {},
  editable,
}: InvoiceLinesTableProps) {
  const { t } = useTranslation('invoices');
  const { enqueueSnackbar } = useSnackbar();

  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [csvExportOpen, setCsvExportOpen] = useState(false);
  const [editingLine, setEditingLine] = useState<InvoiceLine | null>(null);
  const [lineToDelete, setLineToDelete] = useState<InvoiceLine | null>(null);
  const [pagination, setPagination] = useState<MRT_PaginationState>({
    pageIndex: 0,
    pageSize: PAGE_SIZE,
  });

  const [deleteLine, deleteState] = useDeleteInvoiceLineMutation();

  function shippedQuantityFor(lineId: string): string {
    return shippedQuantityByLineId[lineId] ?? '0';
  }

  function lineHasShipping(lineId: string): boolean {
    try {
      return parseDecimal(shippedQuantityFor(lineId)).gt(0);
    } catch {
      return false;
    }
  }

  const existingSelectionLineIds = lines.map(
    (line) => line.selectionLine?.id ?? '',
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
                  }}
                >
                  <ListItemIcon>
                    <EditOutlinedIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>{t('actions.editLine')}</ListItemText>
                </MenuItem>
                {lineHasShipping(line.id) ? null : (
                  <MenuItem onClick={() => setLineToDelete(line)}>
                    <ListItemIcon>
                      <DeleteOutlineIcon fontSize="small" color="error" />
                    </ListItemIcon>
                    <ListItemText>{t('actions.deleteLine')}</ListItemText>
                  </MenuItem>
                )}
              </PermissionGate>
            )
          : undefined,
      }),
    [currency, editable, shippedQuantityByLineId, t, totalAmount],
  );

  async function handleDeleteConfirm() {
    if (!lineToDelete) {
      return;
    }

    try {
      await deleteLine({
        companyId,
        invoiceId,
        lineId: lineToDelete.id,
        requestIds,
        quoteIds,
      }).unwrap();

      enqueueSnackbar(t('toast.lineDeleted'), { variant: 'success' });
      setLineToDelete(null);
    } catch {
      // ApiErrorAlert in the dialog
    }
  }

  return (
    <Stack spacing={2}>
      <PaginatedTable
        columns={columns}
        data={pagedLines}
        rowCount={lines.length}
        pagination={pagination}
        onPaginationChange={setPagination}
        getRowId={(row) => row.id}
        layoutMode="grid"
        renderBottomToolbarCustomActions={() => (
          <Stack direction="row" spacing={1}>
            {editable ? (
              <PermissionGate permission="manageInvoices">
                <ResponsiveIconButton
                  variant="outlined"
                  label={t('actions.addLine')}
                  icon={<AddIcon />}
                  onClick={() => setAddDialogOpen(true)}
                />
              </PermissionGate>
            ) : null}
            <ResponsiveIconButton
              variant="outlined"
              label={t('actions.exportCsv')}
              icon={<FileDownloadOutlinedIcon />}
              onClick={() => setCsvExportOpen(true)}
            />
          </Stack>
        )}
      />

      <InvoiceLinesCsvExportDialog
        open={csvExportOpen}
        onClose={() => setCsvExportOpen(false)}
        companyId={companyId}
        invoiceId={invoiceId}
      />

      <InvoiceDraftLineDialog
        mode="persist"
        open={addDialogOpen}
        onClose={() => setAddDialogOpen(false)}
        companyId={companyId}
        invoiceId={invoiceId}
        currency={currency}
        buyerCompanyId={buyerCompanyId}
        existingSelectionLineIds={existingSelectionLineIds}
        requestIds={requestIds}
        quoteIds={quoteIds}
        onSuccess={() =>
          enqueueSnackbar(t('toast.lineAdded'), { variant: 'success' })
        }
      />

      {editingLine ? (
        <InvoiceLineFormDialog
          open={Boolean(editingLine)}
          onClose={() => setEditingLine(null)}
          companyId={companyId}
          invoiceId={invoiceId}
          requestIds={requestIds}
          quoteIds={quoteIds}
          shippedQuantity={shippedQuantityFor(editingLine.id)}
          line={editingLine}
          onSuccess={() =>
            enqueueSnackbar(t('toast.lineUpdated'), { variant: 'success' })
          }
        />
      ) : null}

      <Dialog
        open={Boolean(lineToDelete)}
        onClose={() => {
          setLineToDelete(null);
          deleteState.reset();
        }}
      >
        <DialogTitle>{t('confirm.deleteLineTitle')}</DialogTitle>
        <DialogContent>
          <ApiErrorAlert error={deleteState.error} />
          <Typography>{t('confirm.deleteLineMessage')}</Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setLineToDelete(null);
              deleteState.reset();
            }}
          >
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
