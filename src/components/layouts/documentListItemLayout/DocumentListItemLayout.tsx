import type { ReactNode } from 'react';
import { Paper, Stack } from '@mui/material';

interface DocumentListItemLayoutProps {
  onClick: () => void;
  content: ReactNode;
  aside?: ReactNode;
}

export function DocumentListItemLayout({
  onClick,
  content,
  aside,
}: DocumentListItemLayoutProps) {
  return (
    <Paper
      component="button"
      type="button"
      variant="outlined"
      onClick={onClick}
      sx={{
        width: '100%',
        textAlign: 'left',
        cursor: 'pointer',
        p: 2,
        borderRadius: 1,
        bgcolor: 'background.paper',
        borderColor: 'divider',
        transition: (theme) =>
          theme.transitions.create(['border-color', 'background-color'], {
            duration: theme.transitions.duration.shorter,
          }),
        '&:hover': {
          borderColor: 'primary.main',
          bgcolor: 'action.hover',
        },
        '&:focus-visible': {
          outline: (theme) => `2px solid ${theme.palette.primary.main}`,
          outlineOffset: 2,
        },
      }}
    >
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={1.5}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', sm: 'center' }}
      >
        <Stack spacing={0.5} sx={{ minWidth: 0, flex: 1 }}>
          {content}
        </Stack>
        {aside}
      </Stack>
    </Paper>
  );
}
