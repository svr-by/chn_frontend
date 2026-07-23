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

import type { QuoteComparisonLine } from '@/api/generated/models/quoteComparisonLine';
import type { SelectionLine } from '@/api/generated/models/selectionLine';
import { useDeleteSelectionLineMutation } from '@/api/endpoints/selectionsApi';
import { ApiErrorAlert } from '@/components/ApiErrorAlert';
import { DecimalDisplay } from '@/components/DecimalDisplay';
import { LineageLink } from '@/components/LineageLink';
import { PermissionGate } from '@/components/PermissionGate';
import { SimpleTable } from '@/components/SimpleTable';
import {
  buildSelectableOffers,
  SelectionLineFormDialog,
} from '@/features/selections/components/SelectionLineFormDialog';

interface SelectionLinesTableProps {
  companyId: string;
  selectionId: string;
  materialRequestId: string;
  lines: SelectionLine[];
  comparisonLines: QuoteComparisonLine[];
  editable: boolean;
}

export function SelectionLinesTable({
  companyId,
  selectionId,
  materialRequestId,
  lines,
  comparisonLines,
  editable,
}: SelectionLinesTableProps) {
  const { t } = useTranslation('selections');
  const { enqueueSnackbar } = useSnackbar();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingLine, setEditingLine] = useState<SelectionLine | null>(null);
  const [lineToDelete, setLineToDelete] = useState<SelectionLine | null>(null);

  const [deleteLine, deleteState] = useDeleteSelectionLineMutation();

  const existingQuoteLineIds = lines.map((line) => line.quoteLine.id);
  const selectableOffers = buildSelectableOffers(
    comparisonLines,
    existingQuoteLineIds,
  );
  const hasSelectableOffers = selectableOffers.length > 0;

  const columns = useMemo<MRT_ColumnDef<SelectionLine>[]>(() => {
    const baseColumns: MRT_ColumnDef<SelectionLine>[] = [
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
        id: 'supplier',
        header: t('columns.supplier'),
        Cell: ({ row }) => row.original.quote.supplierCompany.name,
      },
      {
        id: 'quoteQuantity',
        header: t('columns.quoteQuantity'),
        Cell: ({ row }) => (
          <DecimalDisplay value={row.original.quoteLine.quantity} />
        ),
      },
      {
        accessorKey: 'unitPrice',
        id: 'unitPrice',
        header: t('columns.unitPrice'),
        Cell: ({ row }) => (
          <DecimalDisplay value={row.original.quoteLine.unitPrice} />
        ),
      },
      {
        accessorKey: 'quantity',
        header: t('columns.selectedQuantity'),
        Cell: ({ cell }) => <DecimalDisplay value={cell.getValue<string>()} />,
      },
      {
        id: 'currency',
        header: t('columns.currency'),
        Cell: ({ row }) => row.original.quote.currency,
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
          <PermissionGate permission="manageSelections">
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
      selectionId,
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
        {editable && hasSelectableOffers ? (
          <PermissionGate permission="manageSelections">
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

      <SelectionLineFormDialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setEditingLine(null);
        }}
        companyId={companyId}
        selectionId={selectionId}
        materialRequestId={materialRequestId}
        selectableOffers={selectableOffers}
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
            {t('actions.dismiss')}
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
