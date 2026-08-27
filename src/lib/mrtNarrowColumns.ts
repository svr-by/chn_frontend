import type { SxProps, Theme } from '@mui/material/styles';
import type { MRT_RowData, MRT_TableOptions } from 'material-react-table';

export const MRT_NARROW_ACTIONS_SIZE = 44;
export const MRT_NARROW_LINE_NUMBER_SIZE = 36;

export const mrtEllipsisCellSx = {
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
} as const satisfies SxProps<Theme>;

export const mrtEllipsisCellContentSx = {
  minWidth: 0,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
} as const satisfies SxProps<Theme>;

const mrtEllipsisDirectChildSx = {
  ...mrtEllipsisCellSx,
  '& > *': mrtEllipsisCellContentSx,
} as const satisfies SxProps<Theme>;

export function mergeMrtBodyCellProps<TData extends MRT_RowData>(
  muiTableBodyCellProps?: MRT_TableOptions<TData>['muiTableBodyCellProps'],
): MRT_TableOptions<TData>['muiTableBodyCellProps'] {
  if (typeof muiTableBodyCellProps === 'function') {
    return (params) => {
      const fromProp = muiTableBodyCellProps(params) ?? {};
      return {
        ...fromProp,
        sx: {
          ...mrtEllipsisDirectChildSx,
          ...fromProp.sx,
        },
      };
    };
  }

  return {
    ...muiTableBodyCellProps,
    sx: {
      ...mrtEllipsisDirectChildSx,
      ...muiTableBodyCellProps?.sx,
    },
  };
}

function fixedSizeSx(size: number): SxProps<Theme> {
  return {
    width: size,
    minWidth: size,
    maxWidth: size,
    px: 0.25,
    flex: `0 0 ${size}px`,
    ...mrtEllipsisCellSx,
  };
}

export const mrtNarrowActionsCellSx = fixedSizeSx(MRT_NARROW_ACTIONS_SIZE);
export const mrtNarrowLineNumberCellSx = fixedSizeSx(
  MRT_NARROW_LINE_NUMBER_SIZE,
);

export function mrtFixedSizeColumnProps(size: number) {
  const sx = fixedSizeSx(size);
  return {
    size,
    minSize: size,
    maxSize: size,
    grow: false as const,
    enableResizing: false,
    muiTableHeadCellProps: { sx },
    muiTableBodyCellProps: { sx },
  };
}
