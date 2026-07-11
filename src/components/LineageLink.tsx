import { Link as RouterLink } from 'react-router-dom';
import { Link, Tooltip } from '@mui/material';
import AccountTreeIcon from '@mui/icons-material/AccountTree';

interface LineageLinkProps {
  lineageId: string;
}

function formatLineageId(lineageId: string): string {
  return lineageId.slice(0, 8);
}

export function LineageLink({ lineageId }: LineageLinkProps) {
  return (
    <Tooltip title={lineageId}>
      <Link
        component={RouterLink}
        to={`/app/trace/${lineageId}`}
        underline="hover"
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 0.5,
          fontFamily: 'monospace',
          fontSize: '0.875rem',
        }}
      >
        <AccountTreeIcon sx={{ fontSize: 16 }} />
        {formatLineageId(lineageId)}
      </Link>
    </Tooltip>
  );
}
