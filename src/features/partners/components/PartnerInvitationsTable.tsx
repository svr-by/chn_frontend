import { useMemo } from 'react';
import { IconButton, Stack, Tooltip, Typography } from '@mui/material';
import CheckOutlinedIcon from '@mui/icons-material/CheckOutlined';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import LinkOffOutlinedIcon from '@mui/icons-material/LinkOffOutlined';
import { MaterialReactTable, type MRT_ColumnDef } from 'material-react-table';
import { useTranslation } from 'react-i18next';

import type { TradingPartner } from '@/api/generated/models/tradingPartner';
import { PartnerStatusBadge } from '@/components/PartnerStatusBadge';
import { PermissionGate } from '@/components/PermissionGate';
import { useAppMaterialReactTable } from '@/hooks/useAppMaterialReactTable';

interface PartnerInvitationsTableProps {
  partners: TradingPartner[];
  isLoading?: boolean;
  isFetching?: boolean;
  onAccept: (linkId: string) => void;
  onReject: (linkId: string) => void;
  onCancel: (linkId: string) => void;
  actionsDisabled?: boolean;
  highlightLinkId?: string | null;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString();
}

export function PartnerInvitationsTable({
  partners,
  isLoading = false,
  isFetching = false,
  onAccept,
  onReject,
  onCancel,
  actionsDisabled = false,
  highlightLinkId = null,
}: PartnerInvitationsTableProps) {
  const { t } = useTranslation('partners');

  const sortedPartners = useMemo(
    () =>
      [...partners].sort((a, b) => {
        if (a.direction === b.direction) return 0;
        return a.direction === 'inbound' ? -1 : 1;
      }),
    [partners],
  );

  const columns = useMemo<MRT_ColumnDef<TradingPartner>[]>(
    () => [
      {
        id: 'direction',
        header: t('columns.direction'),
        // Translate here so MRT group headers (groupedColumnMode: remove) show locale labels.
        accessorFn: (row) => t(`groups.${row.direction}`),
        size: 160,
      },
      {
        id: 'name',
        header: t('columns.name'),
        accessorFn: (row) => row.company.name,
      },
      {
        id: 'taxId',
        header: t('columns.taxId'),
        accessorFn: (row) => row.company.taxId ?? '—',
      },
      {
        id: 'country',
        header: t('columns.country'),
        accessorFn: (row) => row.company.country ?? '—',
      },
      {
        accessorKey: 'status',
        header: t('columns.status'),
        size: 120,
        Cell: ({ row }) => <PartnerStatusBadge status={row.original.status} />,
      },
      {
        id: 'invitedAt',
        header: t('columns.invitedAt'),
        accessorFn: (row) => row.invitedAt,
        Cell: ({ cell }) => formatDate(cell.getValue<string>()),
      },
      {
        id: 'actions',
        header: t('columns.actions'),
        size: 120,
        enableSorting: false,
        enableColumnFilter: false,
        muiTableHeadCellProps: { align: 'right' },
        muiTableBodyCellProps: { align: 'right' },
        Cell: ({ row }) => {
          const partner = row.original;
          if (partner.status !== 'INVITED') {
            return null;
          }

          if (partner.direction === 'inbound') {
            return (
              <PermissionGate permission="managePartners">
                <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                  <Tooltip title={t('actions.accept')}>
                    <span>
                      <IconButton
                        size="small"
                        color="success"
                        aria-label={t('actions.accept')}
                        disabled={actionsDisabled}
                        onClick={() => onAccept(partner.id)}
                      >
                        <CheckOutlinedIcon fontSize="small" />
                      </IconButton>
                    </span>
                  </Tooltip>
                  <Tooltip title={t('actions.reject')}>
                    <span>
                      <IconButton
                        size="small"
                        color="error"
                        aria-label={t('actions.reject')}
                        disabled={actionsDisabled}
                        onClick={() => onReject(partner.id)}
                      >
                        <CloseOutlinedIcon fontSize="small" />
                      </IconButton>
                    </span>
                  </Tooltip>
                </Stack>
              </PermissionGate>
            );
          }

          return (
            <PermissionGate permission="managePartners">
              <Tooltip title={t('actions.cancelInvite')}>
                <span>
                  <IconButton
                    size="small"
                    color="warning"
                    aria-label={t('actions.cancelInvite')}
                    disabled={actionsDisabled}
                    onClick={() => onCancel(partner.id)}
                  >
                    <LinkOffOutlinedIcon fontSize="small" />
                  </IconButton>
                </span>
              </Tooltip>
            </PermissionGate>
          );
        },
      },
    ],
    [actionsDisabled, onAccept, onCancel, onReject, t],
  );

  const table = useAppMaterialReactTable({
    columns,
    data: sortedPartners,
    enableBottomToolbar: sortedPartners.length > 10,
    enableExpandAll: false,
    enableGrouping: true,
    enableStickyHeader: true,
    getRowId: (row) => row.id,
    groupedColumnMode: 'remove',
    initialState: {
      expanded: true,
      grouping: ['direction'],
    },
    state: {
      isLoading,
      showProgressBars: isFetching,
    },
    muiTableBodyRowProps: ({ row }) => ({
      selected: highlightLinkId === row.id,
      sx:
        highlightLinkId === row.id
          ? { backgroundColor: 'action.selected' }
          : undefined,
    }),
  });

  if (!isLoading && partners.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary" sx={{ py: 3 }}>
        {t('empty.invitations')}
      </Typography>
    );
  }

  return <MaterialReactTable table={table} />;
}
