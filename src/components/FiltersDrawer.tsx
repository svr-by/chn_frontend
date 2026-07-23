import type { ReactNode } from 'react';
import {
  Box,
  Button,
  Divider,
  Drawer,
  IconButton,
  Stack,
  Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

export interface FiltersDrawerProps {
  open: boolean;
  onClose: () => void;
  title: string;
  closeAriaLabel: string;
  applyLabel: string;
  resetLabel: string;
  onApply: () => void;
  onReset: () => void;
  children: ReactNode;
  width?: { xs?: string | number; sm?: string | number };
}

export function FiltersDrawer({
  open,
  onClose,
  title,
  closeAriaLabel,
  applyLabel,
  resetLabel,
  onApply,
  onReset,
  children,
  width = { xs: '100%', sm: 420 },
}: FiltersDrawerProps) {
  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      slotProps={{
        paper: {
          sx: { width, maxWidth: '100%' },
        },
      }}
    >
      <Stack spacing={2} sx={{ p: 3, height: '100%' }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Typography variant="h6">{title}</Typography>
          <IconButton aria-label={closeAriaLabel} onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Stack>
        <Divider />

        <Stack spacing={2}>{children}</Stack>

        <Box sx={{ flex: 1 }} />
        <Stack direction="row" spacing={1} justifyContent="flex-end">
          <Button onClick={onReset}>{resetLabel}</Button>
          <Button variant="contained" onClick={onApply}>
            {applyLabel}
          </Button>
        </Stack>
      </Stack>
    </Drawer>
  );
}
