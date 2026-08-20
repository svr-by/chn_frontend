import { useEffect, useMemo, useState } from 'react';
import { Button, IconButton, Stack, Tooltip, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import NotesOutlinedIcon from '@mui/icons-material/NotesOutlined';
import UploadFileOutlinedIcon from '@mui/icons-material/UploadFileOutlined';
import TranslateOutlinedIcon from '@mui/icons-material/TranslateOutlined';
import type { MRT_ColumnDef, MRT_PaginationState } from 'material-react-table';
import { useTranslation } from 'react-i18next';

import { DecimalDisplay } from '@/components/dataDisplay/decimalDisplay/DecimalDisplay';
import { ClampedTextDialog } from '@/components/dataDisplay/clampedTextDialog/ClampedTextDialog';
import { PaginatedTable } from '@/components/tables/paginatedTable/PaginatedTable';
import { RequestLineFormDialog } from '@/features/requests/components/requestLineFormDialog/RequestLineFormDialog';
import {
  createEmptyDraftLine,
  updateDraftLine,
  type DraftRequestLine,
  type RequestLineFormValues,
} from '@/features/requests/lib/draftRequestLine';
import {
  MRT_NARROW_ACTIONS_SIZE,
  MRT_NARROW_LINE_NUMBER_SIZE,
  mrtFixedSizeColumnProps,
} from '@/lib/mrtNarrowColumns';

const PAGE_SIZE = 20;

type NumberedDraftLine = DraftRequestLine & { lineNumber: number };

interface RequestDraftLinesSectionProps {
  companyId: string;
  lines: DraftRequestLine[];
  onChange: (lines: DraftRequestLine[]) => void;
  onImportClick: () => void;
  onTranslateClick: () => void;
  errorMessage?: string;
}

export function RequestDraftLinesSection({
  companyId,
  lines,
  onChange,
  onImportClick,
  onTranslateClick,
  errorMessage,
}: RequestDraftLinesSectionProps) {
  const { t } = useTranslation('requests');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingLine, setEditingLine] = useState<DraftRequestLine | null>(null);
  const [pagination, setPagination] = useState<MRT_PaginationState>({
    pageIndex: 0,
    pageSize: PAGE_SIZE,
  });

  useEffect(() => {
    const maxPageIndex = Math.max(
      0,
      Math.ceil(lines.length / pagination.pageSize) - 1,
    );
    if (pagination.pageIndex > maxPageIndex) {
      setPagination((current) => ({ ...current, pageIndex: maxPageIndex }));
    }
  }, [lines.length, pagination.pageIndex, pagination.pageSize]);

  const numberedLines = useMemo<NumberedDraftLine[]>(
    () => lines.map((line, index) => ({ ...line, lineNumber: index + 1 })),
    [lines],
  );

  const pagedLines = useMemo(
    () =>
      numberedLines.slice(
        pagination.pageIndex * pagination.pageSize,
        pagination.pageIndex * pagination.pageSize + pagination.pageSize,
      ),
    [numberedLines, pagination.pageIndex, pagination.pageSize],
  );

  const columns = useMemo<MRT_ColumnDef<NumberedDraftLine>[]>(
    () => [
      {
        id: 'actions',
        header: '',
        ...mrtFixedSizeColumnProps(MRT_NARROW_ACTIONS_SIZE * 2),
        Cell: ({ row }) => (
          <Stack direction="row" spacing={0}>
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
                onClick={() =>
                  onChange(
                    lines.filter(
                      (item) => item.clientId !== row.original.clientId,
                    ),
                  )
                }
              >
                <DeleteOutlineIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Stack>
        ),
      },
      {
        id: 'lineNumber',
        accessorKey: 'lineNumber',
        header: t('columns.lineNumber'),
        ...mrtFixedSizeColumnProps(MRT_NARROW_LINE_NUMBER_SIZE),
      },
      {
        id: 'description',
        accessorKey: 'description',
        header: t('columns.description'),
        grow: true,
      },
      {
        id: 'notes',
        accessorKey: 'notes',
        header: t('columns.notes'),
        size: 120,
        grow: false,
        Cell: ({ row }) => (
          <ClampedTextDialog
            text={row.original.notes}
            title={t('form.notes')}
            closeLabel={t('actions.cancel')}
            previewLines={2}
            icon={
              <NotesOutlinedIcon
                fontSize="small"
                color="action"
                sx={{ mt: 0.5, flex: '0 0 auto' }}
              />
            }
          />
        ),
      },
      {
        id: 'quantity',
        header: t('columns.quantity'),
        size: 120,
        grow: false,
        muiTableBodyCellProps: { align: 'right' },
        muiTableHeadCellProps: { align: 'right' },
        Cell: ({ row }) => (
          <DecimalDisplay
            value={row.original.quantity}
            suffix={row.original.unit ?? ''}
          />
        ),
      },
    ],
    [lines, onChange, t],
  );

  function handleLocalSubmit(values: RequestLineFormValues) {
    if (editingLine) {
      onChange(
        lines.map((line) =>
          line.clientId === editingLine.clientId
            ? updateDraftLine(line, values)
            : line,
        ),
      );
    } else {
      onChange([...lines, createEmptyDraftLine(values)]);
    }
  }

  function openAddDialog() {
    setEditingLine(null);
    setDialogOpen(true);
  }

  return (
    <Stack spacing={2} sx={{ width: '100%', mb: 3 }}>
      {errorMessage ? (
        <Typography color="error" variant="body2">
          {errorMessage}
        </Typography>
      ) : null}

      <PaginatedTable
        columns={columns}
        data={pagedLines}
        rowCount={lines.length}
        pagination={pagination}
        onPaginationChange={setPagination}
        getRowId={(row) => row.clientId}
        layoutMode="grid"
        renderBottomToolbarCustomActions={() => (
          <Stack direction="row" spacing={1}>
            <Button
              type="button"
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={openAddDialog}
            >
              {t('actions.addLine')}
            </Button>
            <Button
              type="button"
              variant="outlined"
              startIcon={<UploadFileOutlinedIcon />}
              onClick={onImportClick}
            >
              {t('actions.importFromFile')}
            </Button>
            <Button
              type="button"
              variant="outlined"
              startIcon={<TranslateOutlinedIcon />}
              onClick={onTranslateClick}
              disabled={lines.length === 0}
            >
              {t('actions.translate')}
            </Button>
          </Stack>
        )}
      />

      <RequestLineFormDialog
        mode="local"
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setEditingLine(null);
        }}
        companyId={companyId}
        draftLine={editingLine}
        onLocalSubmit={handleLocalSubmit}
      />
    </Stack>
  );
}
