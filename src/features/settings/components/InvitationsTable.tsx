import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Chip,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import LinkOffOutlinedIcon from '@mui/icons-material/LinkOffOutlined';
import { useTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';

import type { GetCompaniesCompanyIdMembersInvitations200InvitationsItem } from '@/api/generated/models/getCompaniesCompanyIdMembersInvitations200InvitationsItem';
import { useRevokeInvitationMutation } from '@/api/endpoints/membersApi';
import { ApiErrorAlert } from '@/components/ApiErrorAlert';
import {
  PaginatedTable,
  type MRT_ColumnDef,
  type MRT_PaginationState,
} from '@/components/PaginatedTable';
import { PermissionGate } from '@/components/PermissionGate';
import { formatMemberRole } from '@/features/settings/lib/memberDisplay';

const PAGE_SIZE = 20;

type Invitation = GetCompaniesCompanyIdMembersInvitations200InvitationsItem;

interface InvitationsTableProps {
  companyId: string;
  invitations: Invitation[];
  isLoading?: boolean;
  isFetching?: boolean;
}

export function InvitationsTable({
  companyId,
  invitations,
  isLoading = false,
  isFetching = false,
}: InvitationsTableProps) {
  const { t } = useTranslation(['team', 'auth', 'enums']);
  const { enqueueSnackbar } = useSnackbar();
  const [revokeInvitation, revokeState] = useRevokeInvitationMutation();

  const [pagination, setPagination] = useState<MRT_PaginationState>({
    pageIndex: 0,
    pageSize: PAGE_SIZE,
  });

  useEffect(() => {
    const maxPageIndex = Math.max(
      0,
      Math.ceil(invitations.length / pagination.pageSize) - 1,
    );
    if (pagination.pageIndex > maxPageIndex) {
      setPagination((current) => ({ ...current, pageIndex: maxPageIndex }));
    }
  }, [invitations.length, pagination.pageIndex, pagination.pageSize]);

  const pagedInvitations = useMemo(
    () =>
      invitations.slice(
        pagination.pageIndex * pagination.pageSize,
        pagination.pageIndex * pagination.pageSize + pagination.pageSize,
      ),
    [invitations, pagination.pageIndex, pagination.pageSize],
  );

  const handleRevoke = useCallback(
    async (invitationId: string) => {
      try {
        await revokeInvitation({ companyId, invitationId }).unwrap();
        enqueueSnackbar(t('team:invitationRevoked'), { variant: 'success' });
      } catch {
        // ApiErrorAlert
      }
    },
    [companyId, enqueueSnackbar, revokeInvitation, t],
  );

  const columns = useMemo<MRT_ColumnDef<Invitation>[]>(
    () => [
      {
        accessorKey: 'email',
        header: t('auth:email'),
      },
      {
        accessorKey: 'role',
        header: t('team:role'),
        size: 140,
        Cell: ({ cell }) => (
          <Chip
            size="small"
            variant="outlined"
            label={formatMemberRole(t, cell.getValue<Invitation['role']>())}
          />
        ),
      },
      {
        id: 'expiresAt',
        header: t('team:expiresAt'),
        accessorKey: 'expiresAt',
        Cell: ({ row }) => (
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="body2">
              {new Date(row.original.expiresAt).toLocaleDateString()}
            </Typography>
            {row.original.expired ? (
              <Chip label={t('team:expired')} size="small" color="warning" />
            ) : null}
          </Stack>
        ),
      },
      {
        id: 'actions',
        header: t('team:actions'),
        size: 80,
        enableSorting: false,
        muiTableHeadCellProps: { align: 'right' },
        muiTableBodyCellProps: { align: 'right' },
        Cell: ({ row }) => (
          <PermissionGate permission="manageMembers">
            <Tooltip title={t('team:revoke')}>
              <span>
                <IconButton
                  size="small"
                  aria-label={t('team:revoke')}
                  disabled={revokeState.isLoading}
                  onClick={() => void handleRevoke(row.original.id)}
                >
                  <LinkOffOutlinedIcon fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
          </PermissionGate>
        ),
      },
    ],
    [handleRevoke, revokeState.isLoading, t],
  );

  return (
    <Stack spacing={1}>
      <ApiErrorAlert error={revokeState.error} />
      {!isLoading && invitations.length === 0 ? (
        <Typography variant="body2" color="text.secondary" sx={{ py: 3 }}>
          {t('team:emptyInvitations')}
        </Typography>
      ) : (
        <PaginatedTable
          columns={columns}
          data={pagedInvitations}
          rowCount={invitations.length}
          pagination={pagination}
          onPaginationChange={setPagination}
          isLoading={isLoading}
          isFetching={isFetching}
          getRowId={(row) => row.id}
        />
      )}
    </Stack>
  );
}
