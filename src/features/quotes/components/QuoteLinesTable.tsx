import { useMemo, useState } from 'react';
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
import type { MRT_ColumnDef } from 'material-react-table';
import { useTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';

import type { QuoteLine } from '@/api/generated/models/quoteLine';
import type { RequestLine } from '@/api/generated/models/requestLine';
import { useDeleteQuoteLineMutation } from '@/api/endpoints/quotesApi';
import { ApiErrorAlert } from '@/components/ApiErrorAlert';
import { DecimalDisplay } from '@/components/DecimalDisplay';
import { PermissionGate } from '@/components/PermissionGate';
import { SimpleTable } from '@/components/SimpleTable';
import { QuoteLineFormDialog } from '@/features/quotes/components/QuoteLineFormDialog';
import { MAX_QUOTE_LINE_VARIANTS } from '@/features/quotes/lib/quoteLineVariants';

type OfferRow = {
  id: string;
  requestLineId: string;
  lineNumber: number;
  description: string;
  requestedQuantity: string;
  unit: string | null;
  quoteLine: QuoteLine | null;
  variantIndex: number;
  variantCount: number;
  canAddVariant: boolean;
  isLastInGroup: boolean;
};

interface QuoteLinesTableProps {
  companyId: string;
  quoteId: string;
  materialRequestId: string;
  currency: string;
  lines: QuoteLine[];
  requestLines: RequestLine[];
  editable: boolean;
}

function buildOfferRows(
  lines: QuoteLine[],
  requestLines: RequestLine[],
  editable: boolean,
): OfferRow[] {
  const quoteLinesByRequestLineId = new Map<string, QuoteLine[]>();
  for (const line of lines) {
    const group = quoteLinesByRequestLineId.get(line.requestLineId) ?? [];
    group.push(line);
    quoteLinesByRequestLineId.set(line.requestLineId, group);
  }

  for (const group of quoteLinesByRequestLineId.values()) {
    group.sort((a, b) => a.lineNumber - b.lineNumber);
  }

  if (requestLines.length > 0) {
    return [...requestLines]
      .sort((a, b) => a.lineNumber - b.lineNumber)
      .flatMap((requestLine) => {
        const group = quoteLinesByRequestLineId.get(requestLine.id) ?? [];
        const variantCount = group.length;
        const canAddVariant =
          editable && variantCount < MAX_QUOTE_LINE_VARIANTS;

        if (group.length === 0) {
          return [
            {
              id: `empty-${requestLine.id}`,
              requestLineId: requestLine.id,
              lineNumber: requestLine.lineNumber,
              description: requestLine.description,
              requestedQuantity: requestLine.quantity,
              unit: requestLine.unit ?? null,
              quoteLine: null,
              variantIndex: 0,
              variantCount: 0,
              canAddVariant,
              isLastInGroup: true,
            } satisfies OfferRow,
          ];
        }

        return group.map(
          (quoteLine, index): OfferRow => ({
            id: quoteLine.id,
            requestLineId: requestLine.id,
            lineNumber: requestLine.lineNumber,
            description: requestLine.description,
            requestedQuantity: requestLine.quantity,
            unit: requestLine.unit ?? null,
            quoteLine,
            variantIndex: index + 1,
            variantCount,
            canAddVariant,
            isLastInGroup: index === group.length - 1,
          }),
        );
      });
  }

  return lines.map((line, index, all) => {
    const group = quoteLinesByRequestLineId.get(line.requestLineId) ?? [line];
    const variantIndex = group.findIndex((item) => item.id === line.id) + 1;
    const variantCount = group.length;
    return {
      id: line.id,
      requestLineId: line.requestLineId,
      lineNumber: line.lineNumber,
      description: line.requestLine.description,
      requestedQuantity: line.requestLine.quantity,
      unit: line.requestLine.unit ?? null,
      quoteLine: line,
      variantIndex,
      variantCount,
      canAddVariant: editable && variantCount < MAX_QUOTE_LINE_VARIANTS,
      isLastInGroup:
        index === all.length - 1 ||
        all[index + 1]?.requestLineId !== line.requestLineId,
    };
  });
}

export function QuoteLinesTable({
  companyId,
  quoteId,
  materialRequestId,
  currency,
  lines,
  requestLines,
  editable,
}: QuoteLinesTableProps) {
  const { t } = useTranslation('quotes');
  const { enqueueSnackbar } = useSnackbar();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingLine, setEditingLine] = useState<QuoteLine | null>(null);
  const [initialRequestLineId, setInitialRequestLineId] = useState<
    string | null
  >(null);
  const [lineToDelete, setLineToDelete] = useState<QuoteLine | null>(null);
  const [actionsMenu, setActionsMenu] = useState<{
    anchor: HTMLElement;
    row: OfferRow;
  } | null>(null);

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
    () => buildOfferRows(lines, requestLines, editable),
    [editable, lines, requestLines],
  );

  const columns = useMemo<MRT_ColumnDef<OfferRow>[]>(() => {
    const baseColumns: MRT_ColumnDef<OfferRow>[] = [
      {
        id: 'lineNumber',
        header: t('columns.lineNumber'),
        size: 72,
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
        id: 'leadTime',
        header: t('columns.leadTime'),
        Cell: () => '—',
      },
      {
        id: 'notes',
        header: t('columns.notes'),
        Cell: ({ row }) => row.original.quoteLine?.notes ?? '—',
      },
      {
        id: 'actions',
        header: t('columns.actions'),
        size: editable ? 96 : 56,
        muiTableHeadCellProps: { align: 'right' },
        muiTableBodyCellProps: { align: 'right' },
        Cell: ({ row }) => {
          const offer = row.original;
          const showAdd =
            editable &&
            (offer.quoteLine
              ? offer.canAddVariant && offer.isLastInGroup
              : true);

          return (
            <Stack
              direction="row"
              spacing={0.5}
              sx={{ justifyContent: 'flex-end', alignItems: 'center' }}
            >
              {showAdd ? (
                <PermissionGate permission="manageQuotes">
                  <Tooltip
                    title={
                      offer.quoteLine
                        ? t('actions.addVariant')
                        : t('actions.addOffer')
                    }
                  >
                    <IconButton
                      size="small"
                      color="primary"
                      aria-label={
                        offer.quoteLine
                          ? t('actions.addVariant')
                          : t('actions.addOffer')
                      }
                      onClick={() => {
                        setEditingLine(null);
                        setInitialRequestLineId(offer.requestLineId);
                        setDialogOpen(true);
                      }}
                    >
                      <AddIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </PermissionGate>
              ) : null}
              {offer.quoteLine ? (
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
              ) : null}
            </Stack>
          );
        },
      },
    ];

    return baseColumns;
  }, [actionsMenu?.row.id, currency, editable, t]);

  function closeActionsMenu() {
    setActionsMenu(null);
  }

  const menuQuoteLine = actionsMenu?.row.quoteLine ?? null;

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
        {editable && menuQuoteLine ? (
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
        <SimpleTable
          columns={columns}
          data={rows}
          options={{ getRowId: (row) => row.id }}
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
