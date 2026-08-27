import { useMemo } from 'react';
import { useMediaQuery, useTheme } from '@mui/material';
import { useTranslation } from 'react-i18next';
import {
  useMaterialReactTable,
  type MRT_RowData,
  type MRT_TableOptions,
} from 'material-react-table';

import { getMrtLocalization } from '@/lib/mrtLocalization';
import { mergeMrtBodyCellProps } from '@/lib/mrtNarrowColumns';

export function useAppMaterialReactTable<TData extends MRT_RowData>(
  options: MRT_TableOptions<TData>,
) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { i18n } = useTranslation();

  const localization = useMemo(
    () => getMrtLocalization(i18n.language),
    [i18n.language],
  );

  const {
    muiTableContainerProps,
    muiTablePaperProps,
    layoutMode,
    localization: optionsLocalization,
    muiTableBodyCellProps,
    initialState,
    ...restOptions
  } = options;

  const resolvedContainerProps =
    typeof muiTableContainerProps === 'function'
      ? muiTableContainerProps
      : ({
          ...muiTableContainerProps,
          sx: {
            overflowX: 'auto',
            ...muiTableContainerProps?.sx,
          },
        } as MRT_TableOptions<TData>['muiTableContainerProps']);

  const resolvedPaperProps =
    typeof muiTablePaperProps === 'function'
      ? muiTablePaperProps
      : ({
          elevation: 0,
          ...muiTablePaperProps,
          sx: {
            border: 1,
            borderColor: 'divider',
            ...muiTablePaperProps?.sx,
          },
        } as MRT_TableOptions<TData>['muiTablePaperProps']);

  return useMaterialReactTable({
    enableColumnActions: false,
    enableColumnFilters: false,
    enableDensityToggle: false,
    enableSorting: false,
    enableTopToolbar: false,
    layoutMode: layoutMode ?? (isMobile ? 'grid-no-grow' : 'semantic'),
    localization: optionsLocalization ?? localization,
    muiTableContainerProps: resolvedContainerProps,
    muiTablePaperProps: resolvedPaperProps,
    muiTableBodyCellProps: mergeMrtBodyCellProps(muiTableBodyCellProps),
    initialState: {
      density: 'compact',
      ...initialState,
    },
    ...restOptions,
  });
}
