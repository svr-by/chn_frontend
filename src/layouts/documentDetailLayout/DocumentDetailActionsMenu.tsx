import {
  Children,
  Fragment,
  createContext,
  isValidElement,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactElement,
  type ReactNode,
} from 'react';
import {
  IconButton,
  Menu,
  MenuItem,
  Tooltip,
  type MenuItemProps,
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { useTranslation } from 'react-i18next';

interface DocumentActionMenuContextValue {
  closeMenu: () => void;
  registerItem: () => () => void;
}

const DocumentActionMenuContext =
  createContext<DocumentActionMenuContextValue | null>(null);

/**
 * React 19's Children.toArray no longer flattens Fragments, but MUI Menu
 * rejects Fragment children and cloneElement(tabIndex) on them warns.
 */
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

/** Menu item that registers with DocumentDetailActionsMenu and closes it on click. */
export function DocumentActionMenuItem({
  onClick,
  ...props
}: MenuItemProps) {
  const ctx = useContext(DocumentActionMenuContext);

  useEffect(() => {
    if (!ctx) {
      return;
    }
    return ctx.registerItem();
  }, [ctx]);

  return (
    <MenuItem
      {...props}
      onClick={(event) => {
        onClick?.(event);
        ctx?.closeMenu();
      }}
    />
  );
}

interface DocumentDetailActionsMenuProps {
  children: ReactNode;
}

/**
 * Header ⋮ menu for DocumentDetailLayout.
 * Hides the trigger when no DocumentActionMenuItem is mounted.
 * Uses Menu `keepMounted` so items/dialogs stay mounted and the trigger
 * anchor is never torn down while the menu is open.
 */
export function DocumentDetailActionsMenu({
  children,
}: DocumentDetailActionsMenuProps) {
  const { t } = useTranslation('common');
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [itemCount, setItemCount] = useState(0);
  const open = Boolean(anchorEl);

  const registerItem = useCallback(() => {
    setItemCount((count) => count + 1);
    return () => setItemCount((count) => count - 1);
  }, []);

  const closeMenu = useCallback(() => {
    setAnchorEl(null);
  }, []);

  const contextValue = useMemo(
    () => ({ closeMenu, registerItem }),
    [closeMenu, registerItem],
  );

  return (
    <DocumentActionMenuContext.Provider value={contextValue}>
      {itemCount > 0 ? (
        <Tooltip title={t('actions.more')}>
          <IconButton
            size="small"
            aria-label={t('actions.more')}
            aria-haspopup="menu"
            aria-expanded={open ? 'true' : undefined}
            onClick={(event) => setAnchorEl(event.currentTarget)}
          >
            <MoreVertIcon />
          </IconButton>
        </Tooltip>
      ) : null}

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={closeMenu}
        keepMounted
        disableScrollLock
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        {flattenMenuChildren(children)}
      </Menu>
    </DocumentActionMenuContext.Provider>
  );
}
