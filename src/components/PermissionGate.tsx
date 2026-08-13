import type { ReactNode } from 'react';

import { usePermissions } from '@/hooks/usePermissions';
import type { Permission } from '@/types/api';

interface PermissionGateProps {
  permission: Permission | Permission[];
  children: ReactNode;
  fallback?: ReactNode;
}

export function PermissionGate({
  permission,
  children,
  fallback = null,
}: PermissionGateProps) {
  const { hasPermission, hasAnyPermission } = usePermissions();
  const allowed = Array.isArray(permission)
    ? hasAnyPermission(permission)
    : hasPermission(permission);

  if (!allowed) {
    return fallback;
  }

  return children;
}
