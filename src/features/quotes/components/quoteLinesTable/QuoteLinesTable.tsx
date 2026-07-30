import { useEffect, useMemo, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import AccountTreeOutlinedIcon from '@mui/icons-material/AccountTreeOutlined';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import type { MRT_ColumnDef, MRT_PaginationState } from 'material-react-table';
import { useTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';

import type { QuoteLine } from '@/api/generated/models/quoteLine';
import type { RequestLine } from '@/api/generated/models/requestLine';
import { useDeleteQuoteLineMutation } from '@/api/endpoints/quotesApi';
import { ApiErrorAlert } from '@/components/ApiErrorAlert';
import { DecimalDisplay } from '@/components/DecimalDisplay';
import { PaginatedTable } from '@/components/PaginatedTable';
import { PermissionGate } from '@/components/PermissionGate';
import { RequestLineCancelledBadge } from '@/components/RequestLineCancelledBadge';
import {
  buildQuoteOfferRows,
  type QuoteOfferRow,
} from '@/features/quotes/lib/buildQuoteOfferRows';
import { MAX_QUOTE_LINE_VARIANTS } from '@/features/quotes/lib/quoteLineVariants';
import { QuoteLineFormDialog } from './QuoteLineFormDialog';
import { QuoteLineSelectionCell } from '@/features/quotes/components/quoteLineSelection/QuoteLineSelectionCell';
import {
  MRT_NARROW_ACTIONS_SIZE,
  MRT_NARROW_LINE_NUMBER_SIZE,
  mrtFixedSizeColumnProps,
} from '@/lib/mrtNarrowColumns';

const PAGE_SIZE = 20;

function canAddOfferOrVariant(
  offer: QuoteOfferRow,
  editable: boolean,
): boolean {
  if (!editable || offer.quoteLine?.selectedQuantity != null) {
    return false;
  }
  if (offer.quoteLine) {
    return offer.canAddVariant && offer.isLastInGroup;
  }
  return true;
}

interface QuoteLinesTableProps {
  companyId: string;
  quoteId: string;
  materialRequestId?: string;
  currency: string;
  lines: QuoteLine[];
  requestLines: RequestLine[];
  editable: boolean;
  selectionMode?: 'none' | 'buyer' | 'supplier';
  selectionEnabled?: boolean;
}

export function QuoteLinesTable({
  companyId,
  quoteId,
  materialRequestId,
  currency,
  lines,
  requestLines,
  editable,
  selectionMode = 'none',
  selectionEnabled = false,
}: QuoteLinesTableProps) {
  const { t } = useTranslation(['quotes', 'enums']);
  const { enqueueSnackbar } = useSnackbar();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingLine, setEditingLine] = useState<QuoteLine | null>(null);
  const [initialRequestLineId, setInitialRequestLineId] = useState<
    string | null
  >(null);
  const [lineToDelete, setLineToDelete] = useState<QuoteLine | null>(null);
  const [actionsMenu, setActionsMenu] = useState<{
    anchor: HTMLElement;
    row: QuoteOfferRow;
  } | null>(null);
  const [pagination, setPagination] = useState<MRT_PaginationState>({
    pageIndex: 0,
    pageSize: PAGE_SIZE,
  });

  const [deleteLine, deleteState] = useDeleteQuoteLineMutation();

  const quoteLineCountByRequestLineId = useMemo(() => {
    const counts = new Map<string, number>();
    for (const line of lines) {
      counts.set(line.requestLineId, (counts.get(line.requestLineId) ?? 0) + 1);
    }
    return counts;
  }, [lines]);

  const hasAvailableRequestLines = requestLines.some(
    (requestLine) =>
      (quoteLineCountByRequestLineId.get(requestLine.id) ?? 0) <
      MAX_QUOTE_LINE_VARIANTS,
  );

  const rows = useMemo(
    () => buildQuoteOfferRows(lines, requestLines, editable),
    [editable, lines, requestLines],
  );

  useEffect(() => {
    const maxPageIndex = Math.max(
      0,
      Math.ceil(rows.length / pagination.pageSize) - 1,
    );
    if (pagination.pageIndex > maxPageIndex) {
      setPagination((current) => ({ ...current, pageIndex: maxPageIndex }));
    }
  }, [rows.length, pagination.pageIndex, pagination.pageSize]);

  const pagedRows = useMemo(
    () =>
      rows.slice(
        pagination.pageIndex * pagination.pageSize,
        pagination.pageIndex * pagination.pageSize + pagination.pageSize,
      ),
    [rows, pagination.pageIndex, pagination.pageSize],
  );

  const columns = useMemo<MRT_ColumnDef<QuoteOfferRow>[]>(() => {
    const baseColumns: MRT_ColumnDef<QuoteOfferRow>[] = [
      {
        id: 'actions',
        header: '',
        ...mrtFixedSizeColumnProps(MRT_NARROW_ACTIONS_SIZE),
        Cell: ({ row }) => {
          const offer = row.original;
          const showMenu =
            Boolean(offer.quoteLine) || canAddOfferOrVariant(offer, editable);

          if (!showMenu) {
            return null;
          }

          return (
            <Tooltip title={t('actions.more')}>
              <IconButton
                size="small"
                aria-label={t('actions.more')}
                aria-haspopup="menu"
                aria-expanded={
                  actionsMenu?.row.id === offer.id ? 'true' : undefined
                }
                onClick={(event) => {
                  setActionsMenu({
                    anchor: event.currentTarget,
                    row: offer,
                  });
                }}
              >
                <MoreVertIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          );
        },
      },
      {
        id: 'lineNumber',
        header: t('columns.lineNumber'),
        ...mrtFixedSizeColumnProps(MRT_NARROW_LINE_NUMBER_SIZE),
        Cell: ({ row }) => {
          const { lineNumber, variantIndex, variantCount } = row.original;
          if (variantCount > 1) {
            return `${lineNumber}.${variantIndex}`;
          }
          return lineNumber;
        },
      },
      {
        accessorKey: 'description',
        header: t('columns.requestLine'),
        Cell: ({ row }) => (
          <Stack direction="row" spacing={1} flexWrap="wrap">
            <span>{row.original.description}</span>
            <RequestLineCancelledBadge
              cancelledAt={row.original.cancelledAt}
            />
          </Stack>
        ),
      },
      {
        id: 'requestedQuantity',
        header: t('columns.quantity'),
        Cell: ({ row }) => (
          <>
            <DecimalDisplay value={row.original.requestedQuantity} />
            {row.original.unit ? ` ${row.original.unit}` : ''}
          </>
        ),
      },
      {
        id: 'offerQuantity',
        header: t('columns.offerQuantity'),
        Cell: ({ row }) =>
          row.original.quoteLine ? (
            <DecimalDisplay value={row.original.quoteLine.quantity} />
          ) : (
            '—'
          ),
      },
      {
        id: 'unitPrice',
        header: t('columns.unitPrice'),
        Cell: ({ row }) =>
          row.original.quoteLine ? (
            <>
              <DecimalDisplay value={row.original.quoteLine.unitPrice} />{' '}
              {currency}
            </>
          ) : (
            '—'
          ),
      },
      {
        id: 'lineTotal',
        header: t('columns.lineTotal'),
        Cell: ({ row }) =>
          row.original.quoteLine ? (
            <>
              <DecimalDisplay value={row.original.quoteLine.lineTotal} />{' '}
              {currency}
            </>
          ) : (
            '—'
          ),
      },
      {
        id: 'selectedQuantity',
        header: t('columns.selectedQuantity'),
        Cell: ({ row }) => {
          const quoteLine = row.original.quoteLine;
          if (!quoteLine) {
            return '—';
          }

          if (selectionMode === 'buyer') {
            return (
              <QuoteLineSelectionCell
                companyId={companyId}
                quoteId={quoteId}
                lineId={quoteLine.id}
                maxQuantity={quoteLine.quantity}
                selectedQuantity={quoteLine.selectedQuantity}
                materialRequestId={materialRequestId}
                disabled={!selectionEnabled}
              />
            );
          }

          const selectedQuantity = quoteLine.selectedQuantity;
          return selectedQuantity != null ? (
            <DecimalDisplay value={selectedQuantity} />
          ) : (
            '—'
          );
        },
      },
      {
        id: 'leadTime',
        header: t('columns.leadTime'),
        Cell: ({ row }) => {
          const quoteLine = row.original.quoteLine;
          if (!quoteLine?.leadTime || !quoteLine.leadTimeUnit) {
            return '—';
          }

          return `${quoteLine.leadTime} ${t(
            `enums:leadTimeUnit.${quoteLine.leadTimeUnit.toLowerCase()}`,
          )}`;
        },
      },
      {
        id: 'notes',
        header: t('columns.notes'),
        Cell: ({ row }) => row.original.quoteLine?.notes ?? '—',
      },
    ];

    return baseColumns;
  }, [actionsMenu?.row.id, currency, editable, selectionEnabled, selectionMode, companyId, quoteId, materialRequestId, t]);

  function closeActionsMenu() {
    setActionsMenu(null);
  }

  const menuQuoteLine = actionsMenu?.row.quoteLine ?? null;
  const menuCanAdd = actionsMenu
    ? canAddOfferOrVariant(actionsMenu.row, editable)
    : false;

  async function handleDeleteConfirm() {
    if (!lineToDelete) {
      return;
    }

    await deleteLine({
      companyId,
      quoteId,
      lineId: lineToDelete.id,
      materialRequestId,
    }).unwrap();

    enqueueSnackbar(t('toast.lineDeleted'), { variant: 'success' });
    setLineToDelete(null);
  }

  function closeDialog() {
    setDialogOpen(false);
    setEditingLine(null);
    setInitialRequestLineId(null);
  }

  return (
    <Stack spacing={2}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="h6">{t('linesTitle')}</Typography>
        {editable && hasAvailableRequestLines && requestLines.length === 0 ? (
          <PermissionGate permission="manageQuotes">
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={() => {
                setEditingLine(null);
                setInitialRequestLineId(null);
                setDialogOpen(true);
              }}
            >
              {t('actions.addLine')}
            </Button>
          </PermissionGate>
        ) : null}
      </Stack>

      <ApiErrorAlert error={deleteState.error} />

      <Menu
        anchorEl={actionsMenu?.anchor ?? null}
        open={Boolean(actionsMenu)}
        onClose={closeActionsMenu}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        {menuQuoteLine ? (
          <MenuItem
            component={RouterLink}
            to={`/app/trace/${menuQuoteLine.lineageId}`}
            onClick={closeActionsMenu}
          >
            <ListItemIcon>
              <AccountTreeOutlinedIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>{t('actions.openTrace')}</ListItemText>
          </MenuItem>
        ) : null}
        {menuCanAdd ? (
          <PermissionGate permission="manageQuotes">
            <MenuItem
              onClick={() => {
                setEditingLine(null);
                setInitialRequestLineId(actionsMenu?.row.requestLineId ?? null);
                setDialogOpen(true);
                closeActionsMenu();
              }}
            >
              <ListItemIcon>
                <AddIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>
                {menuQuoteLine
                  ? t('actions.addVariant')
                  : t('actions.addOffer')}
              </ListItemText>
            </MenuItem>
          </PermissionGate>
        ) : null}
        {editable && menuQuoteLine && menuQuoteLine.selectedQuantity == null ? (
          <PermissionGate permission="manageQuotes">
            <MenuItem
              onClick={() => {
                setEditingLine(menuQuoteLine);
                setInitialRequestLineId(null);
                setDialogOpen(true);
                closeActionsMenu();
              }}
            >
              <ListItemIcon>
                <EditOutlinedIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>{t('actions.editLine')}</ListItemText>
            </MenuItem>
            <MenuItem
              onClick={() => {
                setLineToDelete(menuQuoteLine);
                closeActionsMenu();
              }}
            >
              <ListItemIcon>
                <DeleteOutlineIcon fontSize="small" color="error" />
              </ListItemIcon>
              <ListItemText>{t('actions.deleteLine')}</ListItemText>
            </MenuItem>
          </PermissionGate>
        ) : null}
      </Menu>

      {rows.length === 0 ? (
        <Typography color="text.secondary">{t('empty.lines')}</Typography>
      ) : (
        <PaginatedTable
          columns={columns}
          data={pagedRows}
          rowCount={rows.length}
          pagination={pagination}
          onPaginationChange={setPagination}
          getRowId={(row) => row.id}
          layoutMode="grid"
        />
      )}

      <QuoteLineFormDialog
        open={dialogOpen}
        onClose={closeDialog}
        companyId={companyId}
        quoteId={quoteId}
        materialRequestId={materialRequestId}
        currency={currency}
        requestLines={requestLines}
        quoteLineCountByRequestLineId={quoteLineCountByRequestLineId}
        line={editingLine}
        initialRequestLineId={initialRequestLineId}
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
