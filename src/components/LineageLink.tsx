import { Link as RouterLink } from 'react-router-dom';
import { IconButton, Link, Tooltip } from '@mui/material';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import { useTranslation } from 'react-i18next';

interface LineageLinkProps {
  lineageId: string;
  /** Show only the trace icon (no id text). */
  iconOnly?: boolean;
}

function formatLineageId(lineageId: string): string {
  return lineageId.slice(0, 8);
}

export function LineageLink({ lineageId, iconOnly = false }: LineageLinkProps) {
  const { t } = useTranslation('common');
  const label = t('lineage.open', {
    defaultValue: 'Open trace',
  });

  if (iconOnly) {
    return (
      <Tooltip title={label}>
        <IconButton
          component={RouterLink}
          to={`/app/trace/${lineageId}`}
          size="small"
          aria-label={label}
        >
          <AccountTreeIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    );
  }

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
