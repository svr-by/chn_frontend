import { Outlet } from 'react-router-dom';
import { Box } from '@mui/material';

import {
  AuthenticatedTopBar,
  useHasAuthSession,
} from '@/components/AuthenticatedTopBar';

interface AuthStandaloneLayoutProps {
  centered?: boolean;
  maxWidth?: number | string;
}

export function AuthStandaloneLayout({
  centered = true,
  maxWidth = 560,
}: AuthStandaloneLayoutProps) {
  const hasSession = useHasAuthSession();

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: 'background.default',
      }}
    >
      <AuthenticatedTopBar />
      <Box
        component="main"
        sx={{
          minHeight: '100vh',
          p: 2,
          pt: hasSession ? 10 : 2,
          ...(centered
            ? {
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }
            : {}),
        }}
      >
        <Box sx={{ width: '100%', maxWidth: centered ? maxWidth : 'none' }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
