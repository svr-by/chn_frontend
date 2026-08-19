import { TablePagination } from '@mui/material';
import type { SxProps, Theme } from '@mui/material/styles';

interface ListPaginationProps {
  count: number;
  page: number;
  onPageChange: (page: number) => void;
  rowsPerPage: number;
  sx?: SxProps<Theme>;
}

export function ListPagination({
  count,
  page,
  onPageChange,
  rowsPerPage,
  sx,
}: ListPaginationProps) {
  return (
    <TablePagination
      component="div"
      count={count}
      page={page}
      onPageChange={(_event, nextPage) => onPageChange(nextPage)}
      rowsPerPage={rowsPerPage}
      rowsPerPageOptions={[rowsPerPage]}
      onRowsPerPageChange={() => undefined}
      sx={{
        mt: 'auto',
        borderTop: 1,
        borderColor: 'divider',
        '.MuiToolbar-root': { px: 0 },
        ...sx,
      }}
    />
  );
}
