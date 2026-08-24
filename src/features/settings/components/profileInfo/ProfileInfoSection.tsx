import { Box, Paper, Typography } from '@mui/material';
import type { ReactNode } from 'react';

export interface ProfileInfoSectionProps {
  title: string;
  hint: string;
  children: ReactNode;
}

export function ProfileInfoSection({
  title,
  hint,
  children,
}: ProfileInfoSectionProps) {
  return (
    <Paper
      variant="outlined"
      sx={{
        p: { xs: 2, sm: 2.5 },
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        minWidth: 0,
      }}
    >
      <Typography variant="subtitle1" component="h2">
        {title}
      </Typography>
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ mt: 0.5, mb: 1.5 }}
      >
        {hint}
      </Typography>
      <Box sx={{ flex: 1, minWidth: 0 }}>{children}</Box>
    </Paper>
  );
}
