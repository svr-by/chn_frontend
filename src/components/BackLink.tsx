import { Link as RouterLink } from 'react-router-dom';
import { Link } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import type { ReactNode } from 'react';

interface BackLinkProps {
  to: string;
  children: ReactNode;
}

export function BackLink({ to, children }: BackLinkProps) {
  return (
    <Link
      component={RouterLink}
      to={to}
      underline="hover"
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 0.5,
        alignSelf: 'flex-start',
      }}
    >
      <ArrowBackIcon fontSize="small" />
      {children}
    </Link>
  );
}
