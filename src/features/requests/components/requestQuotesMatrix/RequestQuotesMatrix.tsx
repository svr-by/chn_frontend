import { useMemo, useState } from 'react';
import {
  Box,
  Button,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import HorizontalRuleIcon from '@mui/icons-material/HorizontalRule';
import {
  MaterialReactTable,
  type MRT_ColumnDef,
  type MRT_RowSelectionState,
} from 'material-react-table';
import { useTranslation } from 'react-i18next';

import type { RequestDistribution } from '@/api/generated/models/requestDistribution';
import type { RequestLine } from '@/api/generated/models/requestLine';
import { useGetRequestDistributionsQuery } from '@/api/endpoints/requestsApi';
import { ApiErrorAlert } from '@/components/ApiErrorAlert';
import { DecimalDisplay } from '@/components/DecimalDisplay';
import { DistributionStatusBadge } from '@/components/DistributionStatusBadge';
import { RequestDistributeToSupplierDialog } from '@/features/requests/components/requestQuotesMatrix/RequestDistributeToSupplierDialog';
import { useAppMaterialReactTable } from '@/hooks/useAppMaterialReactTable';
import { usePermissions } from '@/hooks/usePermissions';
import { PermissionGate } from '@/components/PermissionGate';

interface RequestQuotesMatrixProps {
  companyId: string;
  requestId: string;
  requestLines: RequestLine[];
  requestStatus: string;
}

function lineIdsForDistribution(
  distribution: RequestDistribution,
): Set<string> {
  return new Set(distribution.lines.map((line) => line.id));
}

export function RequestQuotesMatrix({
  companyId,
  requestId,
  requestLines,
  requestStatus,
}: RequestQuotesMatrixProps) {
  const { t } = useTranslation('requests');
  const { hasPermission } = usePermissions();
  const [rowSelection, setRowSelection] = useState<MRT_RowSelectionState>({});
  const [distributeOpen, setDistributeOpen] = useState(false);
  const [dialogLineIds, setDialogLineIds] = useState<string[]>([]);
  const [initialSupplierCompanyId, setInitialSupplierCompanyId] = useState<
    string | undefined
  >();

  const canDistribute =
    ['DRAFT', 'QUOTING'].includes(requestStatus) &&
    hasPermission('manageRequests');

  const selectedLineIds = useMemo(
    () => Object.keys(rowSelection).filter((id) => rowSelection[id]),
    [rowSelection],
  );

  const distributionsQuery = useGetRequestDistributionsQuery(
    { companyId, requestId },
    { skip: !companyId || !requestId },
  );

  const distributions = useMemo(() => {
    const items = distributionsQuery.data?.distributions ?? [];
    // Newest distribution becomes the rightmost column.
    return [...items].sort(
      (a, b) =>
        new Date(a.distributedAt).getTime() - new Date(b.distributedAt).getTime(),
    );
  }, [distributionsQuery.data?.distributions]);

  const lineIdSets = useMemo(
    () =>
      new Map(
        distributions.map((distribution) => [
          distribution.id,
          lineIdsForDistribution(distribution),
        ]),
      ),
    [distributions],
  );

  const columns = useMemo<MRT_ColumnDef<RequestLine>[]>(() => {
    const baseColumns: MRT_ColumnDef<RequestLine>[] = [
      {
        id: 'lineNumber',
        accessorKey: 'lineNumber',
        header: t('columns.lineNumber'),
        size: 56,
      },
      {
        id: 'description',
        accessorKey: 'description',
        header: t('columns.description'),
        size: 280,
      },
      {
        id: 'quantity',
        header: t('columns.quantity'),
        size: 100,
        muiTableHeadCellProps: { align: 'center' },
        muiTableBodyCellProps: { align: 'center' },
        Cell: ({ row }) => <DecimalDisplay value={row.original.quantity} />,
      },
      {
        id: 'unit',
        header: t('columns.unit'),
        size: 80,
        muiTableHeadCellProps: { align: 'center' },
        muiTableBodyCellProps: { align: 'center' },
        Cell: ({ row }) => row.original.unit ?? '—',
      },
    ];

    const supplierColumns: MRT_ColumnDef<RequestLine>[] = distributions.map(
      (distribution) => ({
        id: `distribution-${distribution.id}`,
        header: distribution.supplierCompany.name,
        size: 140,
        muiTableHeadCellProps: { align: 'center' },
        muiTableBodyCellProps: { align: 'center' },
        Header: () => (
          <Stack spacing={0.75} alignItems="center">
            <Typography variant="subtitle2" textAlign="center">
              {distribution.supplierCompany.name}
            </Typography>
            <DistributionStatusBadge status={distribution.status} />
            {distribution.status === 'REJECTED' && canDistribute ? (
              <Button
                size="small"
                onClick={() => {
                  setDialogLineIds(distribution.lines.map((line) => line.id));
                  setInitialSupplierCompanyId(distribution.supplierCompany.id);
                  setDistributeOpen(true);
                }}
              >
                {t('distributions.resend')}
              </Button>
            ) : null}
          </Stack>
        ),
        Cell: ({ row }) => {
          const assigned = lineIdSets.get(distribution.id)?.has(row.original.id);
          if (!assigned) {
            return (
              <Tooltip title={t('quotesMatrix.notSent')}>
                <HorizontalRuleIcon
                  fontSize="small"
                  color="disabled"
                  aria-label={t('quotesMatrix.notSent')}
                />
              </Tooltip>
            );
          }

          return (
            <Tooltip title={t('quotesMatrix.sent')}>
              <CheckIcon
                fontSize="small"
                color={distribution.status === 'REJECTED' ? 'error' : 'success'}
                aria-label={t('quotesMatrix.sent')}
              />
            </Tooltip>
          );
        },
      }),
    );

    return [...baseColumns, ...supplierColumns];
  }, [canDistribute, distributions, lineIdSets, t]);

  const table = useAppMaterialReactTable({
    columns,
    data: requestLines,
    getRowId: (row) => row.id,
    enablePagination: false,
    enableBottomToolbar: false,
    enableRowSelection: canDistribute,
    enableTopToolbar: canDistribute,
    onRowSelectionChange: setRowSelection,
    state: { rowSelection },
    renderTopToolbarCustomActions: () => (
      <PermissionGate permission="manageRequests">
        <Button
          variant="contained"
          size="small"
          disabled={selectedLineIds.length === 0}
          onClick={() => {
            setDialogLineIds(selectedLineIds);
            setInitialSupplierCompanyId(undefined);
            setDistributeOpen(true);
          }}
        >
          {requestStatus === 'DRAFT'
            ? t('actions.sendToSuppliers')
            : t('actions.addSuppliers')}
        </Button>
      </PermissionGate>
    ),
  });

  function handleDistributeClose() {
    setDistributeOpen(false);
    setDialogLineIds([]);
    setInitialSupplierCompanyId(undefined);
  }

  return (
    <Stack spacing={2}>
      <ApiErrorAlert error={distributionsQuery.error} />

      {distributionsQuery.isLoading ? (
        <Typography color="text.secondary">{t('quotesMatrix.loading')}</Typography>
      ) : requestLines.length === 0 ? (
        <Typography color="text.secondary">{t('empty.lines')}</Typography>
      ) : (
        <Box>
          <MaterialReactTable table={table} />
        </Box>
      )}

      <RequestDistributeToSupplierDialog
        open={distributeOpen}
        companyId={companyId}
        requestId={requestId}
        requestLineIds={dialogLineIds}
        initialSupplierCompanyId={initialSupplierCompanyId}
        onClose={handleDistributeClose}
        onDistributed={() => setRowSelection({})}
      />
    </Stack>
  );
}
