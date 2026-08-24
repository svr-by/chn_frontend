import { useCallback, useMemo } from 'react';
import {
  Box,
  Button,
  Stack,
  Switch,
  Typography,
  useTheme,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { MaterialReactTable, type MRT_ColumnDef } from 'material-react-table';
import { useTranslation } from 'react-i18next';

import { useAppMaterialReactTable } from '@/hooks/useAppMaterialReactTable';
import {
  PERMISSION_ROWS,
  applyPermissionToggle,
  buildRoleDefaults,
  isPermissionEffective,
  type PermissionRow,
} from '@/features/settings/lib/permissionGroups';
import type { Permission } from '@/types/api';

interface MemberPermissionsEditorProps {
  grants: Permission[];
  denies: Permission[];
  /** Saved effective permissions (role + currently persisted overrides). */
  effectivePermissions: Permission[];
  /** Overrides currently persisted on the member (used to infer role defaults). */
  initialGrants: Permission[];
  initialDenies: Permission[];
  disabled?: boolean;
  onGrantsChange: (grants: Permission[]) => void;
  onDeniesChange: (denies: Permission[]) => void;
}

export function MemberPermissionsEditor({
  grants,
  denies,
  effectivePermissions,
  initialGrants,
  initialDenies,
  disabled = false,
  onGrantsChange,
  onDeniesChange,
}: MemberPermissionsEditorProps) {
  const { t } = useTranslation(['team', 'integrations']);
  const theme = useTheme();

  const roleDefaults = useMemo(
    () => buildRoleDefaults(effectivePermissions, initialGrants, initialDenies),
    [effectivePermissions, initialDenies, initialGrants],
  );

  const handleToggle = useCallback(
    (permission: Permission, enabled: boolean) => {
      const next = applyPermissionToggle(
        permission,
        enabled,
        roleDefaults,
        grants,
        denies,
      );
      onGrantsChange(next.grants);
      onDeniesChange(next.denies);
    },
    [denies, grants, onDeniesChange, onGrantsChange, roleDefaults],
  );

  function handleClear() {
    onGrantsChange([]);
    onDeniesChange([]);
  }

  const columns = useMemo<MRT_ColumnDef<PermissionRow>[]>(
    () => [
      {
        id: 'group',
        accessorKey: 'groupKey',
        header: t('team:permissionGroup'),
        size: 140,
        Cell: ({ cell }) =>
          t(`integrations:scopeGroups.${cell.getValue<string>()}`),
      },
      {
        id: 'permission',
        accessorKey: 'permission',
        header: t('team:permission'),
        Cell: ({ cell }) =>
          t(`integrations:scopes.${cell.getValue<Permission>()}`),
      },
      {
        id: 'enabled',
        header: t('team:permissionEnabled'),
        size: 120,
        enableSorting: false,
        muiTableHeadCellProps: { align: 'center' },
        muiTableBodyCellProps: { align: 'center' },
        Cell: ({ row }) => {
          const permission = row.original.permission;
          const enabled = isPermissionEffective(
            permission,
            grants,
            denies,
            roleDefaults,
          );
          return (
            <Switch
              size="small"
              checked={enabled}
              disabled={disabled}
              onChange={(_event, checked) => handleToggle(permission, checked)}
              inputProps={{
                'aria-label': `${t(`integrations:scopes.${permission}`)}: ${
                  enabled ? t('team:allowed') : t('team:blocked')
                }`,
              }}
            />
          );
        },
      },
    ],
    [denies, disabled, grants, handleToggle, roleDefaults, t],
  );

  const table = useAppMaterialReactTable({
    columns,
    data: PERMISSION_ROWS,
    getRowId: (row) => row.id,
    enableDensityToggle: false,
    enableFullScreenToggle: false,
    enableHiding: false,
    enablePagination: false,
    enableBottomToolbar: false,
    muiTableContainerProps: {
      sx: { maxHeight: 520 },
    },
    muiTableBodyRowProps: ({ row }) => {
      const permission = row.original.permission;
      const enabled = isPermissionEffective(
        permission,
        grants,
        denies,
        roleDefaults,
      );
      const roleHas = roleDefaults.has(permission);
      const overridden = enabled !== roleHas;
      return {
        sx: {
          bgcolor: overridden
            ? alpha(
                enabled
                  ? theme.palette.success.main
                  : theme.palette.warning.main,
                0.08,
              )
            : undefined,
        },
      };
    },
  });

  return (
    <Stack spacing={2}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'stretch', sm: 'center' }}
        spacing={1}
      >
        <Typography variant="body2" color="text.secondary">
          {t('team:permissionOverridesHint')}
        </Typography>
        <Button
          size="small"
          disabled={disabled || (grants.length === 0 && denies.length === 0)}
          onClick={handleClear}
          sx={{ alignSelf: { xs: 'flex-start', sm: 'center' } }}
        >
          {t('team:clearOverrides')}
        </Button>
      </Stack>

      <Box>
        <MaterialReactTable table={table} />
      </Box>
    </Stack>
  );
}
