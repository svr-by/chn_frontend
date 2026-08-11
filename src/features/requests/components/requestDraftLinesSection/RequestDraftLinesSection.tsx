import { useEffect, useMemo, useState } from 'react';
import { Button, IconButton, Stack, Tooltip, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import UploadFileOutlinedIcon from '@mui/icons-material/UploadFileOutlined';
import type { MRT_ColumnDef, MRT_PaginationState } from 'material-react-table';
import { useTranslation } from 'react-i18next';

import { DecimalDisplay } from '@/components/DecimalDisplay';
import { PaginatedTable } from '@/components/PaginatedTable';
import { RequestLineFormDialog } from '@/features/requests/components/RequestLineFormDialog';
import {
  createEmptyDraftLine,
  updateDraftLine,
  type DraftRequestLine,
  type RequestLineFormValues,
} from '@/features/requests/lib/draftRequestLine';

const PAGE_SIZE = 20;

type NumberedDraftLine = DraftRequestLine & { lineNumber: number };

interface RequestDraftLinesSectionProps {
  companyId: string;
  lines: DraftRequestLine[];
  onChange: (lines: DraftRequestLine[]) => void;
  onImportClick: () => void;
  errorMessage?: string;
}

export function RequestDraftLinesSection({
  companyId,
  lines,
  onChange,
  onImportClick,
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
        accessorKey: 'lineNumber',
        header: t('columns.lineNumber'),
        size: 10,
        maxSize: 10,
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
        muiTableHeadCellProps: { align: 'right' },
        muiTableBodyCellProps: { align: 'right' },
        Cell: ({ cell }) => <DecimalDisplay value={cell.getValue<string>()} />,
      },
      {
        accessorKey: 'unit',
        header: t('columns.unit'),
        size: 20,
        maxSize: 20,
        enableResizing: true,
        muiTableHeadCellProps: { align: 'center' },
        muiTableBodyCellProps: { align: 'center' },
        Cell: ({ cell }) => cell.getValue<string | undefined>() ?? '—',
      },
      {
        accessorKey: 'notes',
        size: 50,
        maxSize: 200,
        enableResizing: true,
        header: t('columns.notes'),
        Cell: ({ cell }) => cell.getValue<string | undefined>() ?? '—',
      },
      {
        id: 'actions',
        header: t('columns.actions'),
        size: 20,
        maxSize: 20,
        enableResizing: true,
        muiTableHeadCellProps: { align: 'right' },
        muiTableBodyCellProps: { align: 'right' },
        Cell: ({ row }) => (
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
