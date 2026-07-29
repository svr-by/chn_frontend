import type { SxProps, Theme } from '@mui/material/styles';

export const MRT_NARROW_ACTIONS_SIZE = 44;
export const MRT_NARROW_LINE_NUMBER_SIZE = 36;

function fixedSizeSx(size: number): SxProps<Theme> {
  return {
    width: size,
    minWidth: size,
    maxWidth: size,
    px: 0.25,
    flex: `0 0 ${size}px`,
    whiteSpace: 'nowrap',
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
