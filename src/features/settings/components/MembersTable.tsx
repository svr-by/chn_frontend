import { useEffect, useMemo, useState } from 'react';
import { Chip, IconButton, Stack, Tooltip, Typography } from '@mui/material';
import ManageAccountsOutlinedIcon from '@mui/icons-material/ManageAccountsOutlined';
import PersonRemoveOutlinedIcon from '@mui/icons-material/PersonRemoveOutlined';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import type { CompanyMember } from '@/api/generated/models/companyMember';
import {
  PaginatedTable,
  type MRT_ColumnDef,
  type MRT_PaginationState,
} from '@/components/tables/paginatedTable/PaginatedTable';
import { PermissionGate } from '@/components/auth/permissionGate/PermissionGate';
import {
  formatMemberRole,
  formatUserName,
} from '@/features/settings/lib/memberDisplay';
import { usePermissions } from '@/hooks/usePermissions';

const PAGE_SIZE = 20;

interface MembersTableProps {
  members: CompanyMember[];
  isLoading?: boolean;
  isFetching?: boolean;
  onRemove: (memberId: string) => void;
}

export function MembersTable({
  members,
  isLoading = false,
  isFetching = false,
  onRemove,
}: MembersTableProps) {
  const { t } = useTranslation(['team', 'enums']);
  const navigate = useNavigate();
  const { hasPermission, hasAnyPermission } = usePermissions();
  const canManageAccess = hasAnyPermission([
    'manageMembers',
    'manageMemberPermissions',
  ]);
  const canRemove = hasPermission('manageMembers');

  const [pagination, setPagination] = useState<MRT_PaginationState>({
    pageIndex: 0,
    pageSize: PAGE_SIZE,
  });

  useEffect(() => {
    const maxPageIndex = Math.max(
      0,
      Math.ceil(members.length / pagination.pageSize) - 1,
    );
    if (pagination.pageIndex > maxPageIndex) {
      setPagination((current) => ({ ...current, pageIndex: maxPageIndex }));
    }
  }, [members.length, pagination.pageIndex, pagination.pageSize]);

  const pagedMembers = useMemo(
    () =>
      members.slice(
        pagination.pageIndex * pagination.pageSize,
        pagination.pageIndex * pagination.pageSize + pagination.pageSize,
      ),
    [members, pagination.pageIndex, pagination.pageSize],
  );

  const columns = useMemo<MRT_ColumnDef<CompanyMember>[]>(
    () => [
      {
        id: 'member',
        header: t('team:member'),
        accessorFn: (row) =>
          formatUserName(
            row.user?.firstName,
            row.user?.lastName,
            row.user?.email ?? '',
          ),
        Cell: ({ row }) => {
          const email = row.original.user?.email ?? '';
          const name = formatUserName(
            row.original.user?.firstName,
            row.original.user?.lastName,
            email,
          );
          return (
            <Stack spacing={0.25}>
              <Typography variant="body2">{name}</Typography>
              {name !== email && email ? (
                <Typography variant="caption" color="text.secondary">
                  {email}
                </Typography>
              ) : null}
            </Stack>
          );
        },
      },
      {
        accessorKey: 'role',
        header: t('team:role'),
        size: 140,
        Cell: ({ cell }) => (
          <Chip
            size="small"
            label={formatMemberRole(t, cell.getValue<CompanyMember['role']>())}
            color={cell.getValue<string>() === 'OWNER' ? 'primary' : 'default'}
            variant={
              cell.getValue<string>() === 'OWNER' ? 'filled' : 'outlined'
            }
          />
        ),
      },
      {
        accessorKey: 'status',
        header: t('team:status'),
        size: 120,
        Cell: ({ cell }) => {
          const status = cell.getValue<CompanyMember['status']>();
          return (
            <Chip
              size="small"
              label={t(`team:memberStatus.${status.toLowerCase()}`)}
              color={status === 'ACTIVE' ? 'success' : 'warning'}
              variant="outlined"
            />
          );
        },
      },
      {
        id: 'actions',
        header: t('team:actions'),
        size: 100,
        enableSorting: false,
        muiTableHeadCellProps: { align: 'right' },
        muiTableBodyCellProps: { align: 'right' },
        Cell: ({ row }) => {
          const member = row.original;
          const isOwner = member.role === 'OWNER';

          if (!canManageAccess && !canRemove) {
            return null;
          }

          return (
            <Stack direction="row" spacing={0.5} justifyContent="flex-end">
              {canManageAccess && !isOwner ? (
                <Tooltip title={t('team:manageAccess')}>
                  <IconButton
                    size="small"
                    aria-label={t('team:manageAccess')}
                    onClick={() => navigate(`/app/settings/team/${member.id}`)}
                  >
                    <ManageAccountsOutlinedIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              ) : null}
              <PermissionGate permission="manageMembers">
                {!isOwner ? (
                  <Tooltip title={t('team:remove')}>
                    <IconButton
                      size="small"
                      color="error"
                      aria-label={t('team:remove')}
                      onClick={() => onRemove(member.id)}
                    >
                      <PersonRemoveOutlinedIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                ) : null}
              </PermissionGate>
            </Stack>
          );
        },
      },
    ],
    [canManageAccess, canRemove, navigate, onRemove, t],
  );

  if (!isLoading && members.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary" sx={{ py: 3 }}>
        {t('team:emptyMembers')}
      </Typography>
    );
  }

  return (
    <PaginatedTable
      columns={columns}
      data={pagedMembers}
      rowCount={members.length}
      pagination={pagination}
      onPaginationChange={setPagination}
      isLoading={isLoading}
      isFetching={isFetching}
      getRowId={(row) => row.id}
    />
  );
}
