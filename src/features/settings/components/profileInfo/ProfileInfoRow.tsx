import {
  Box,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
} from '@mui/material';
import type { ReactNode } from 'react';

export interface ProfileInfoRowProps {
  icon: ReactNode;
  label: string;
  value: ReactNode;
  action?: ReactNode;
}

export function ProfileInfoRow({
  icon,
  label,
  value,
  action,
}: ProfileInfoRowProps) {
  return (
    <ListItem
      alignItems="flex-start"
      secondaryAction={action}
      sx={{
        px: 0,
        py: { xs: 1, sm: 1.25 },
        '&:not(:last-of-type)': {
          borderBottom: 1,
          borderColor: 'divider',
        },
      }}
    >
      <ListItemIcon sx={{ minWidth: 36, mt: 0.35 }}>{icon}</ListItemIcon>
      <ListItemText
        sx={{ my: 0, minWidth: 0 }}
        primary={
          <Typography variant="caption" color="text.secondary" component="div">
            {label}
          </Typography>
        }
        secondary={
          typeof value === 'string' || typeof value === 'number' ? (
            <Typography
              variant="body2"
              color="text.primary"
              component="span"
              sx={{
                display: 'block',
                mt: 0.25,
                wordBreak: 'break-word',
              }}
            >
              {value}
            </Typography>
          ) : (
            <Box sx={{ mt: 0.5 }}>{value}</Box>
          )
        }
        slotProps={{
          primary: { component: 'div' },
          secondary: { component: 'div' },
        }}
      />
    </ListItem>
  );
}
