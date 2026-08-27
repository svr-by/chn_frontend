import type { TableRowProps } from '@mui/material';
import {
  MaterialReactTable,
  type MRT_ColumnDef,
  type MRT_ColumnFiltersState,
  type MRT_PaginationState,
  type MRT_RowSelectionState,
  type MRT_TableOptions,
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
  layoutMode?: MRT_TableOptions<T>['layoutMode'];
  enableColumnFilters?: boolean;
  enableRowSelection?: boolean;
  rowSelection?: MRT_RowSelectionState;
  onRowSelectionChange?: MRT_TableOptions<T>['onRowSelectionChange'];
  manualFiltering?: boolean;
  columnFilters?: MRT_ColumnFiltersState;
  onColumnFiltersChange?: MRT_TableOptions<T>['onColumnFiltersChange'];
  columnFilterDisplayMode?: MRT_TableOptions<T>['columnFilterDisplayMode'];
  enableFullScreenToggle?: boolean;
  enableGlobalFilter?: boolean;
  globalFilter?: string;
  onGlobalFilterChange?: MRT_TableOptions<T>['onGlobalFilterChange'];
  muiSearchTextFieldProps?: MRT_TableOptions<T>['muiSearchTextFieldProps'];
  positionGlobalFilter?: MRT_TableOptions<T>['positionGlobalFilter'];
  renderBottomToolbarCustomActions?: MRT_TableOptions<T>['renderBottomToolbarCustomActions'];
  renderTopToolbarCustomActions?: MRT_TableOptions<T>['renderTopToolbarCustomActions'];
  muiTableBodyRowProps?: MRT_TableOptions<T>['muiTableBodyRowProps'];
  muiTableBodyCellProps?: MRT_TableOptions<T>['muiTableBodyCellProps'];
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
  layoutMode,
  enableColumnFilters,
  enableRowSelection = false,
  rowSelection,
  onRowSelectionChange,
  manualFiltering,
  columnFilters,
  onColumnFiltersChange,
  columnFilterDisplayMode,
  enableFullScreenToggle = false,
  enableGlobalFilter = false,
  globalFilter,
  onGlobalFilterChange,
  muiSearchTextFieldProps,
  positionGlobalFilter,
  renderBottomToolbarCustomActions,
  renderTopToolbarCustomActions,
  muiTableBodyRowProps,
  muiTableBodyCellProps,
}: PaginatedTableProps<T>) {
  const table = useAppMaterialReactTable({
    columns,
    data,
    layoutMode,
    enableBottomToolbar: true,
    enableTopToolbar:
      enableFullScreenToggle ||
      enableGlobalFilter ||
      Boolean(renderTopToolbarCustomActions),
    enableFullScreenToggle,
    enableGlobalFilter,
    enableGlobalFilterModes: false,
    positionGlobalFilter,
    muiSearchTextFieldProps,
    onGlobalFilterChange,
    enableHiding: false,
    enableColumnFilters,
    enableRowSelection,
    onRowSelectionChange,
    manualFiltering,
    onColumnFiltersChange,
    columnFilterDisplayMode,
    manualPagination: true,
    rowCount,
    onPaginationChange,
    state: {
      pagination,
      isLoading,
      showProgressBars: isFetching,
      ...(columnFilters !== undefined ? { columnFilters } : {}),
      ...(globalFilter !== undefined ? { globalFilter } : {}),
      ...(rowSelection !== undefined ? { rowSelection } : {}),
    },
    muiTableBodyRowProps: ({ row, staticRowIndex, table: mrtTable }) => {
      const fromProp: TableRowProps =
        typeof muiTableBodyRowProps === 'function'
          ? (muiTableBodyRowProps({ row, staticRowIndex, table: mrtTable }) ??
            {})
          : (muiTableBodyRowProps ?? {});

      if (!onRowClick) {
        return fromProp;
      }

      return {
        ...fromProp,
        onClick: (event) => {
          fromProp.onClick?.(event);
          onRowClick(row.original);
        },
        sx: {
          cursor: 'pointer',
          ...fromProp.sx,
        },
      };
    },
    muiTableBodyCellProps,
    getRowId: getRowId ? (row) => getRowId(row) : undefined,
    renderBottomToolbarCustomActions,
    renderTopToolbarCustomActions,
  });

  return <MaterialReactTable table={table} />;
}

export type { MRT_ColumnDef, MRT_ColumnFiltersState, MRT_PaginationState };
