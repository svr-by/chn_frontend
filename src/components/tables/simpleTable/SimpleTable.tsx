import {
  MaterialReactTable,
  type MRT_ColumnDef,
  type MRT_RowData,
  type MRT_TableOptions,
} from 'material-react-table';

import { useAppMaterialReactTable } from '@/hooks/useAppMaterialReactTable';

type SimpleTableOptions<TData extends MRT_RowData> = Omit<
  MRT_TableOptions<TData>,
  'columns' | 'data'
>;

interface SimpleTableProps<TData extends MRT_RowData> {
  columns: MRT_ColumnDef<TData>[];
  data: TData[];
  options?: SimpleTableOptions<TData>;
}

export function SimpleTable<TData extends MRT_RowData>({
  columns,
  data,
  options,
}: SimpleTableProps<TData>) {
  const table = useAppMaterialReactTable({
    columns,
    data,
    enableBottomToolbar: false,
    enablePagination: false,
    ...options,
  });

  return <MaterialReactTable table={table} />;
}

export type { MRT_ColumnDef };
