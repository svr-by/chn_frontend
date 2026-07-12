import {
  MaterialReactTable,
  useMaterialReactTable,
  type MRT_ColumnDef,
  type MRT_PaginationState,
} from 'material-react-table';
import { useMediaQuery, useTheme } from '@mui/material';

interface PaginatedTableProps<T extends object> {
  columns: MRT_ColumnDef<T>[];
  data: T[];
  rowCount: number;
  pagination: MRT_PaginationState;
  onPaginationChange: (
    updater:
      | MRT_PaginationState
      | ((prev: MRT_PaginationState) => MRT_PaginationState),
  ) => void;
  isLoading?: boolean;
  isFetching?: boolean;
  onRowClick?: (row: T) => void;
  getRowId?: (row: T) => string;
}

export function PaginatedTable<T extends object>({
  columns,
  data,
  rowCount,
  pagination,
  onPaginationChange,
  isLoading = false,
  isFetching = false,
  onRowClick,
  getRowId,
}: PaginatedTableProps<T>) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const table = useMaterialReactTable({
    columns,
    data,
    enableColumnActions: false,
    enableColumnFilters: false,
    enableSorting: false,
    enableTopToolbar: false,
    enableBottomToolbar: true,
    manualPagination: true,
    rowCount,
    onPaginationChange,
    layoutMode: isMobile ? 'grid-no-grow' : 'semantic',
    state: {
      pagination,
      isLoading,
      showProgressBars: isFetching,
    },
    muiTableBodyRowProps: onRowClick
      ? ({ row }) => ({
          onClick: () => onRowClick(row.original),
          sx: { cursor: 'pointer' },
        })
      : undefined,
    getRowId: getRowId ? (row) => getRowId(row) : undefined,
    muiTableContainerProps: {
      sx: { overflowX: 'auto' },
    },
    muiTablePaperProps: {
      elevation: 0,
      sx: { border: 1, borderColor: 'divider' },
    },
  });

  return <MaterialReactTable table={table} />;
}

export type { MRT_ColumnDef, MRT_PaginationState };
