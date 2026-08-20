import { useEffect, useMemo, useState } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Tooltip,
  Typography,
} from '@mui/material';
import LinkOffOutlinedIcon from '@mui/icons-material/LinkOffOutlined';
import { useTranslation } from 'react-i18next';

import type { TradingPartner } from '@/api/generated/models/tradingPartner';
import { PartnerStatusBadge } from '@/components/status/partnerStatusBadge/PartnerStatusBadge';
import { PermissionGate } from '@/components/auth/permissionGate/PermissionGate';
import {
  PaginatedTable,
  type MRT_ColumnDef,
  type MRT_PaginationState,
} from '@/components/tables/paginatedTable/PaginatedTable';
import { formatLocalizedDate } from '@/lib/dateFormat';

const PAGE_SIZE = 20;

interface ActivePartnersTableProps {
  partners: TradingPartner[];
  isLoading?: boolean;
  isFetching?: boolean;
  onUnlink: (linkId: string) => void;
  actionsDisabled?: boolean;
}

export function ActivePartnersTable({
  partners,
  isLoading = false,
  isFetching = false,
  onUnlink,
  actionsDisabled = false,
}: ActivePartnersTableProps) {
  const { t, i18n } = useTranslation('partners');
  const [partnerToUnlink, setPartnerToUnlink] = useState<TradingPartner | null>(
    null,
  );

  const [pagination, setPagination] = useState<MRT_PaginationState>({
    pageIndex: 0,
    pageSize: PAGE_SIZE,
  });

  useEffect(() => {
    const maxPageIndex = Math.max(
      0,
      Math.ceil(partners.length / pagination.pageSize) - 1,
    );
    if (pagination.pageIndex > maxPageIndex) {
      setPagination((current) => ({ ...current, pageIndex: maxPageIndex }));
    }
  }, [partners.length, pagination.pageIndex, pagination.pageSize]);

  const pagedPartners = useMemo(
    () =>
      partners.slice(
        pagination.pageIndex * pagination.pageSize,
        pagination.pageIndex * pagination.pageSize + pagination.pageSize,
      ),
    [partners, pagination.pageIndex, pagination.pageSize],
  );

  const columns = useMemo<MRT_ColumnDef<TradingPartner>[]>(
    () => [
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
        id: 'acceptedAt',
        header: t('columns.acceptedAt'),
        size: 80,
        muiTableHeadCellProps: { align: 'center' },
        muiTableBodyCellProps: { align: 'center' },
        accessorFn: (row) => row.acceptedAt,
        Cell: ({ cell }) =>
          formatLocalizedDate(cell.getValue<string | null>(), i18n.language),
      },
      {
        id: 'actions',
        header: t('columns.actions'),
        size: 80,
        enableSorting: false,
        muiTableHeadCellProps: { align: 'right' },
        muiTableBodyCellProps: { align: 'right' },
        Cell: ({ row }) => (
          <PermissionGate permission="managePartners">
            <Tooltip title={t('actions.unlink')}>
              <span>
                <IconButton
                  size="small"
                  color="error"
                  aria-label={t('actions.unlink')}
                  disabled={actionsDisabled}
                  onClick={() => setPartnerToUnlink(row.original)}
                >
                  <LinkOffOutlinedIcon fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
          </PermissionGate>
        ),
      },
    ],
    [actionsDisabled, t],
  );

  if (!isLoading && partners.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary" sx={{ py: 3 }}>
        {t('empty.partners')}
      </Typography>
    );
  }

  return (
    <>
      <PaginatedTable
        columns={columns}
        data={pagedPartners}
        rowCount={partners.length}
        pagination={pagination}
        onPaginationChange={setPagination}
        isLoading={isLoading}
        isFetching={isFetching}
        getRowId={(row) => row.id}
      />

      <Dialog
        open={Boolean(partnerToUnlink)}
        onClose={() => setPartnerToUnlink(null)}
      >
        <DialogTitle>{t('unlink.title')}</DialogTitle>
        <DialogContent>
          <Typography>
            {t('unlink.confirm', {
              name: partnerToUnlink?.company.name ?? '',
            })}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPartnerToUnlink(null)}>
            {t('actions.close')}
          </Button>
          <Button
            color="error"
            variant="contained"
            disabled={actionsDisabled}
            onClick={() => {
              if (!partnerToUnlink) return;
              onUnlink(partnerToUnlink.id);
              setPartnerToUnlink(null);
            }}
          >
            {t('actions.unlink')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
