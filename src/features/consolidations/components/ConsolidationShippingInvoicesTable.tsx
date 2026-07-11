import { useMemo, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Link,
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

import type { ConsolidationShippingInvoiceEntry } from '@/api/generated/models/consolidationShippingInvoiceEntry';
import type { ShippingInvoiceSummary } from '@/api/generated/models/shippingInvoiceSummary';
import { useRemoveConsolidationShippingInvoiceMutation } from '@/api/endpoints/consolidationsApi';
import { ApiErrorAlert } from '@/components/ApiErrorAlert';
import { PermissionGate } from '@/components/PermissionGate';
import { ShippingInvoiceStatusBadge } from '@/components/ShippingInvoiceStatusBadge';
import { ConsolidationShippingInvoiceAddDialog } from '@/features/consolidations/components/ConsolidationShippingInvoiceAddDialog';

interface ConsolidationShippingInvoicesTableProps {
  companyId: string;
  consolidationId: string;
  entries: ConsolidationShippingInvoiceEntry[];
  consolidatableInvoices: ShippingInvoiceSummary[];
  editable: boolean;
}

export function ConsolidationShippingInvoicesTable({
  companyId,
  consolidationId,
  entries,
  consolidatableInvoices,
  editable,
}: ConsolidationShippingInvoicesTableProps) {
  const { t } = useTranslation('consolidations');
  const { enqueueSnackbar } = useSnackbar();

  const [addOpen, setAddOpen] = useState(false);
  const [entryToRemove, setEntryToRemove] =
    useState<ConsolidationShippingInvoiceEntry | null>(null);

  const [removeShippingInvoice, removeState] =
    useRemoveConsolidationShippingInvoiceMutation();

  const existingIds = new Set(entries.map((entry) => entry.shippingInvoice.id));
  const hasAvailableInvoices = consolidatableInvoices.some(
    (invoice) => !existingIds.has(invoice.id),
  );

  const columns = useMemo<MRT_ColumnDef<ConsolidationShippingInvoiceEntry>[]>(
    () => {
      const baseColumns: MRT_ColumnDef<ConsolidationShippingInvoiceEntry>[] = [
        {
          accessorKey: 'lineNumber',
          header: t('columns.lineNumber'),
          size: 60,
        },
        {
          id: 'shippingInvoice',
          header: t('columns.shippingInvoice'),
          Cell: ({ row }) => (
            <Link
              component={RouterLink}
              to={`/app/shipping-invoices/${row.original.shippingInvoice.id}`}
              underline="hover"
            >
              {row.original.shippingInvoice.id.slice(0, 8)}
            </Link>
          ),
        },
        {
          id: 'supplier',
          header: t('columns.supplier'),
          Cell: ({ row }) =>
            row.original.shippingInvoice.supplierCompany?.name ?? '—',
        },
        {
          id: 'status',
          header: t('columns.status'),
          Cell: ({ row }) => (
            <ShippingInvoiceStatusBadge
              status={row.original.shippingInvoice.status}
            />
          ),
        },
        {
          id: 'trackingNumber',
          header: t('columns.trackingNumber'),
          Cell: ({ row }) => row.original.shippingInvoice.trackingNumber ?? '—',
        },
        {
          id: 'carrier',
          header: t('columns.carrier'),
          Cell: ({ row }) => row.original.shippingInvoice.carrier ?? '—',
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
            <PermissionGate permission="manageConsolidations">
              <Button
                size="small"
                color="error"
                onClick={() => setEntryToRemove(row.original)}
              >
                {t('actions.removeShippingInvoice')}
              </Button>
            </PermissionGate>
          ),
        });
      }

      return baseColumns;
    },
    [editable, t],
  );

  const table = useMaterialReactTable({
    columns,
    data: entries,
    enablePagination: false,
    enableTopToolbar: false,
    enableBottomToolbar: false,
    getRowId: (row) => row.id,
  });

  async function handleRemove() {
    if (!entryToRemove) {
      return;
    }

    await removeShippingInvoice({
      companyId,
      consolidationId,
      shippingInvoiceId: entryToRemove.shippingInvoice.id,
    }).unwrap();

    enqueueSnackbar(t('toast.shippingInvoiceRemoved'), { variant: 'success' });
    setEntryToRemove(null);
  }

  return (
    <Stack spacing={2}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="h6">{t('shippingInvoicesTitle')}</Typography>
        {editable ? (
          <PermissionGate permission="manageConsolidations">
            <Button
              variant="outlined"
              onClick={() => setAddOpen(true)}
              disabled={!hasAvailableInvoices}
            >
              {t('actions.addShippingInvoice')}
            </Button>
          </PermissionGate>
        ) : null}
      </Stack>

      {entries.length === 0 ? (
        <Typography color="text.secondary">{t('empty.shippingInvoices')}</Typography>
      ) : (
        <MaterialReactTable table={table} />
      )}

      <ConsolidationShippingInvoiceAddDialog
        open={addOpen}
        onClose={() => setAddOpen(false)}
        companyId={companyId}
        consolidationId={consolidationId}
        existingEntries={entries}
        consolidatableInvoices={consolidatableInvoices}
      />

      <Dialog
        open={entryToRemove !== null}
        onClose={() => setEntryToRemove(null)}
      >
        <DialogTitle>{t('confirm.removeShippingInvoiceTitle')}</DialogTitle>
        <DialogContent>
          <ApiErrorAlert error={removeState.error} />
          <Typography>{t('confirm.removeShippingInvoiceMessage')}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEntryToRemove(null)}>
            {t('actions.dismiss')}
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleRemove}
            disabled={removeState.isLoading}
          >
            {t('actions.removeShippingInvoice')}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
