import {
  Children,
  Fragment,
  isValidElement,
  useState,
  type ReactElement,
  type ReactNode,
} from 'react';
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

/** React 19 Children.toArray no longer flattens Fragments; MUI Menu rejects them. */
function flattenMenuChildren(children: ReactNode): ReactElement[] {
  return Children.toArray(children).flatMap((child) => {
    if (!isValidElement(child)) {
      return [];
    }
    if (child.type === Fragment) {
      return flattenMenuChildren(
        (child.props as { children?: ReactNode }).children,
      );
    }
    return [child];
  });
}

/** Per-row ⋮ menu with Open trace, plus optional extra items. */
export function LineRowActionsMenu({
  lineageId,
  moreLabel,
  openTraceLabel,
  children,
}: LineRowActionsMenuProps) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  function closeMenu() {
    setAnchorEl(null);
  }

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
        onClose={closeMenu}
        onClick={closeMenu}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
      >
        <OpenTraceMenuItem
          lineageId={lineageId}
          label={openTraceLabel}
          onClick={closeMenu}
        />
        {flattenMenuChildren(children)}
      </Menu>
    </>
  );
}
