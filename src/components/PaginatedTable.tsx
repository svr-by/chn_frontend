import {
  MaterialReactTable,
  type MRT_ColumnDef,
  type MRT_PaginationState,
} from 'material-react-table';

import { useAppMaterialReactTable } from '@/hooks/useAppMaterialReactTable';

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
  const table = useAppMaterialReactTable({
    columns,
    data,
    enableBottomToolbar: true,
    manualPagination: true,
    rowCount,
    onPaginationChange,
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
  });

  return <MaterialReactTable table={table} />;
}

export type { MRT_ColumnDef, MRT_PaginationState };
