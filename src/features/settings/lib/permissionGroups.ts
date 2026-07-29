import { PermissionValues, type Permission } from '@/types/api';

export interface PermissionGroup {
  labelKey: string;
  permissions: Permission[];
}

export const PERMISSION_GROUPS: PermissionGroup[] = [
  {
    labelKey: 'members',
    permissions: [
      PermissionValues.viewMembers,
      PermissionValues.manageMembers,
      PermissionValues.manageMemberPermissions,
      PermissionValues.manageCompany,
    ],
  },
  {
    labelKey: 'partners',
    permissions: [
      PermissionValues.viewPartners,
      PermissionValues.managePartners,
    ],
  },
  {
    labelKey: 'catalog',
    permissions: [
      PermissionValues.viewProducts,
      PermissionValues.manageProducts,
    ],
  },
  {
    labelKey: 'procurement',
    permissions: [
      PermissionValues.viewRequests,
      PermissionValues.manageRequests,
      PermissionValues.viewQuotes,
      PermissionValues.manageQuotes,
    ],
  },
  {
    labelKey: 'finance',
    permissions: [
      PermissionValues.viewInvoices,
      PermissionValues.manageInvoices,
      PermissionValues.viewPayments,
      PermissionValues.managePayments,
      PermissionValues.confirmPayments,
    ],
  },
  {
    labelKey: 'logistics',
    permissions: [
      PermissionValues.viewShippingInvoices,
      PermissionValues.manageShippingInvoices,
      PermissionValues.viewConsolidations,
      PermissionValues.manageConsolidations,
    ],
  },
  {
    labelKey: 'other',
    permissions: [
      PermissionValues.viewNotifications,
      PermissionValues.viewTrace,
      PermissionValues.manageIntegrations,
    ],
  },
];

export interface PermissionRow {
  id: Permission;
  groupKey: string;
  permission: Permission;
}

export const PERMISSION_ROWS: PermissionRow[] = PERMISSION_GROUPS.flatMap(
  (group) =>
    group.permissions.map((permission) => ({
      id: permission,
      groupKey: group.labelKey,
      permission,
    })),
);

export function togglePermission(
  permissions: Permission[],
  permission: Permission,
): Permission[] {
  return permissions.includes(permission)
    ? permissions.filter((item) => item !== permission)
    : [...permissions, permission];
}

/** Infer role baseline by reversing saved grants/denies against effective permissions. */
export function buildRoleDefaults(
  effectivePermissions: Permission[],
  grants: Permission[],
  denies: Permission[],
): Set<Permission> {
  const defaults = new Set(effectivePermissions);
  for (const grant of grants) {
    defaults.delete(grant);
  }
  for (const deny of denies) {
    defaults.add(deny);
  }
  return defaults;
}

export function isPermissionEffective(
  permission: Permission,
  grants: Permission[],
  denies: Permission[],
  roleDefaults: Set<Permission>,
): boolean {
  if (denies.includes(permission)) {
    return false;
  }
  if (grants.includes(permission)) {
    return true;
  }
  return roleDefaults.has(permission);
}

/** Map a desired on/off state to grants/denies relative to the role baseline. */
export function applyPermissionToggle(
  permission: Permission,
  enabled: boolean,
  roleDefaults: Set<Permission>,
  grants: Permission[],
  denies: Permission[],
): { grants: Permission[]; denies: Permission[] } {
  const roleHas = roleDefaults.has(permission);
  let nextGrants = grants.filter((item) => item !== permission);
  let nextDenies = denies.filter((item) => item !== permission);

  if (enabled) {
    if (!roleHas) {
      nextGrants = [...nextGrants, permission];
    }
  } else if (roleHas) {
    nextDenies = [...nextDenies, permission];
  }

  return { grants: nextGrants, denies: nextDenies };
}
