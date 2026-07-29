import { useState, type ReactNode } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Tooltip,
} from '@mui/material';
import AccountTreeOutlinedIcon from '@mui/icons-material/AccountTreeOutlined';
import MoreVertIcon from '@mui/icons-material/MoreVert';

interface OpenTraceMenuItemProps {
  lineageId: string;
  label: string;
  onClick?: () => void;
}

export function OpenTraceMenuItem({
  lineageId,
  label,
  onClick,
}: OpenTraceMenuItemProps) {
  return (
    <MenuItem
      component={RouterLink}
      to={`/app/trace/${lineageId}`}
      onClick={onClick}
    >
      <ListItemIcon>
        <AccountTreeOutlinedIcon fontSize="small" />
      </ListItemIcon>
      <ListItemText>{label}</ListItemText>
    </MenuItem>
  );
}

interface LineRowActionsMenuProps {
  lineageId: string;
  moreLabel: string;
  openTraceLabel: string;
  children?: ReactNode;
}

/** Per-row ⋮ menu with Open trace, plus optional extra items. */
export function LineRowActionsMenu({
  lineageId,
  moreLabel,
  openTraceLabel,
  children,
}: LineRowActionsMenuProps) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  return (
    <>
      <Tooltip title={moreLabel}>
        <IconButton
          size="small"
          aria-label={moreLabel}
          aria-haspopup="menu"
          aria-expanded={anchorEl ? 'true' : undefined}
          onClick={(event) => setAnchorEl(event.currentTarget)}
        >
          <MoreVertIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
      >
        <OpenTraceMenuItem
          lineageId={lineageId}
          label={openTraceLabel}
          onClick={() => setAnchorEl(null)}
        />
        {children}
      </Menu>
    </>
  );
}
