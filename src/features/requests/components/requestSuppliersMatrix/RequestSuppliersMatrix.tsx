import { useEffect, useMemo, useState } from 'react';
import {
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import ReplayOutlinedIcon from '@mui/icons-material/ReplayOutlined';
import type { MRT_ColumnDef, MRT_PaginationState } from 'material-react-table';
import { useTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';

import type { RequestDistribution } from '@/api/generated/models/requestDistribution';
import type { RequestLine } from '@/api/generated/models/requestLine';
import {
  useDeleteRequestDistributionMutation,
  useDistributeRequestMutation,
  useGetRequestDistributionsQuery,
} from '@/api/endpoints/requestsApi';
import { ApiErrorAlert } from '@/components/ApiErrorAlert';
import { DecimalDisplay } from '@/components/DecimalDisplay';
import { PaginatedTable } from '@/components/PaginatedTable';
import { PermissionGate } from '@/components/PermissionGate';
import { RequestDistributeToSupplierDialog } from '@/features/requests/components/requestSuppliersMatrix/RequestDistributeToSupplierDialog';
import { usePermissions } from '@/hooks/usePermissions';

const PAGE_SIZE = 20;

interface RequestSuppliersMatrixProps {
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

function areLineSetsEqual(a: Set<string>, b: Set<string>): boolean {
  if (a.size !== b.size) {
    return false;
  }
  for (const id of a) {
    if (!b.has(id)) {
      return false;
    }
  }
  return true;
}

export function RequestSuppliersMatrix({
  companyId,
  requestId,
  requestLines,
  requestStatus,
}: RequestSuppliersMatrixProps) {
  const { t } = useTranslation('requests');
  const { enqueueSnackbar } = useSnackbar();
  const { hasPermission } = usePermissions();
  const [addSupplierOpen, setAddSupplierOpen] = useState(false);
  const [draftLineIds, setDraftLineIds] = useState<Record<string, string[]>>(
    {},
  );
  const [distributionToSave, setDistributionToSave] =
    useState<RequestDistribution | null>(null);
  const [distributionToResend, setDistributionToResend] =
    useState<RequestDistribution | null>(null);
  const [distributionToRemove, setDistributionToRemove] =
    useState<RequestDistribution | null>(null);
  const [pagination, setPagination] = useState<MRT_PaginationState>({
    pageIndex: 0,
    pageSize: PAGE_SIZE,
  });

  const canDistribute =
    ['DRAFT', 'QUOTING'].includes(requestStatus) &&
    hasPermission('manageRequests');

  const distributionsQuery = useGetRequestDistributionsQuery(
    { companyId, requestId },
    { skip: !companyId || !requestId },
  );

  const [deleteDistribution, deleteState] =
    useDeleteRequestDistributionMutation();
  const [distributeRequest, distributeState] = useDistributeRequestMutation();

  const distributions = useMemo(() => {
    const items = distributionsQuery.data?.distributions ?? [];
    // Newest distribution becomes the rightmost column.
    return [...items].sort(
      (a, b) =>
        new Date(a.distributedAt).getTime() -
        new Date(b.distributedAt).getTime(),
    );
  }, [distributionsQuery.data?.distributions]);

  const savedLineIdSets = useMemo(
    () =>
      new Map(
        distributions.map((distribution) => [
          distribution.id,
          lineIdsForDistribution(distribution),
        ]),
      ),
    [distributions],
  );

  useEffect(() => {
    setDraftLineIds((current) => {
      const next: Record<string, string[]> = {};
      for (const distribution of distributions) {
        next[distribution.id] = distribution.lines.map((line) => line.id);
      }

      const currentIds = Object.keys(current);
      const nextIds = Object.keys(next);
      if (
        currentIds.length === nextIds.length &&
        nextIds.every((id) =>
          areLineSetsEqual(new Set(current[id] ?? []), new Set(next[id] ?? [])),
        )
      ) {
        return current;
      }

      return next;
    });
  }, [distributions]);

  useEffect(() => {
    const maxPageIndex = Math.max(
      0,
      Math.ceil(requestLines.length / pagination.pageSize) - 1,
    );
    if (pagination.pageIndex > maxPageIndex) {
      setPagination((current) => ({ ...current, pageIndex: maxPageIndex }));
    }
  }, [requestLines.length, pagination.pageIndex, pagination.pageSize]);

  const pagedLines = useMemo(
    () =>
      requestLines.slice(
        pagination.pageIndex * pagination.pageSize,
        pagination.pageIndex * pagination.pageSize + pagination.pageSize,
      ),
    [requestLines, pagination.pageIndex, pagination.pageSize],
  );

  function isDirty(distributionId: string): boolean {
    const saved = savedLineIdSets.get(distributionId) ?? new Set<string>();
    const draft = new Set(draftLineIds[distributionId] ?? []);
    return !areLineSetsEqual(saved, draft);
  }

  function toggleDraftLine(distributionId: string, lineId: string) {
    setDraftLineIds((current) => {
      const existing = new Set(current[distributionId] ?? []);
      if (existing.has(lineId)) {
        existing.delete(lineId);
      } else {
        existing.add(lineId);
      }
      return {
        ...current,
        [distributionId]: Array.from(existing),
      };
    });
  }

  async function submitDistributionLines(
    distribution: RequestDistribution,
    requestLineIds: string[],
  ) {
    await distributeRequest({
      companyId,
      requestId,
      createProducts: false,
      distributions: [
        {
          supplierCompanyId: distribution.supplierCompany.id,
          requestLineIds,
        },
      ],
    }).unwrap();
    enqueueSnackbar(t('distribute.toast.success'), { variant: 'success' });
  }

  async function handleSaveConfirm() {
    if (!distributionToSave) {
      return;
    }

    const requestLineIds = draftLineIds[distributionToSave.id] ?? [];
    if (requestLineIds.length === 0) {
      return;
    }

    try {
      await submitDistributionLines(distributionToSave, requestLineIds);
      setDistributionToSave(null);
    } catch {
      // ApiErrorAlert below
    }
  }

  async function handleResendConfirm() {
    if (!distributionToResend) {
      return;
    }

    const requestLineIds =
      draftLineIds[distributionToResend.id] ??
      distributionToResend.lines.map((line) => line.id);
    if (requestLineIds.length === 0) {
      return;
    }

    try {
      await submitDistributionLines(distributionToResend, requestLineIds);
      setDistributionToResend(null);
    } catch {
      // ApiErrorAlert below
    }
  }

  async function handleRemoveConfirm() {
    if (!distributionToRemove) {
      return;
    }

    try {
      await deleteDistribution({
        companyId,
        requestId,
        distributionId: distributionToRemove.id,
      }).unwrap();
      enqueueSnackbar(t('distributions.toast.removed'), { variant: 'success' });
      setDistributionToRemove(null);
    } catch {
      // ApiErrorAlert below
    }
  }

  const columns = useMemo<MRT_ColumnDef<RequestLine>[]>(() => {
    const baseColumns: MRT_ColumnDef<RequestLine>[] = [
      {
        id: 'lineNumber',
        accessorKey: 'lineNumber',
        header: t('columns.lineNumber'),
        size: 10,
        maxSize: 10,
        muiTableHeadCellProps: { sx: { width: 20 } },
        muiTableBodyCellProps: { sx: { width: 20 } },
      },
      {
        id: 'description',
        accessorKey: 'description',
        header: t('columns.description'),
      },
      {
        id: 'quantity',
        header: t('columns.quantity'),
        size: 20,
        maxSize: 20,
        enableResizing: true,
        muiTableHeadCellProps: { align: 'center' },
        muiTableBodyCellProps: { align: 'center' },
        Cell: ({ row }) => <DecimalDisplay value={row.original.quantity} />,
      },
      {
        id: 'unit',
        header: t('columns.unit'),
        size: 20,
        maxSize: 20,
        enableResizing: true,
        muiTableHeadCellProps: { align: 'center' },
        muiTableBodyCellProps: { align: 'center' },
        Cell: ({ row }) => row.original.unit ?? '—',
      },
    ];

    const supplierColumns: MRT_ColumnDef<RequestLine>[] = distributions.map(
      (distribution) => {
        const dirty = isDirty(distribution.id);
        const draftIds = new Set(draftLineIds[distribution.id] ?? []);
        const isRejected = distribution.status === 'REJECTED';
        const canEditLines = canDistribute && distribution.status === 'PENDING';
        const draftCount = draftIds.size;

        return {
          id: `distribution-${distribution.id}`,
          header: distribution.supplierCompany.name,
          size: 160,
          muiTableHeadCellProps: { align: 'center' },
          muiTableBodyCellProps: { align: 'center' },
          Header: () => (
            <Stack spacing={0.75} alignItems="center">
              <Stack
                direction="row"
                spacing={0.5}
                alignItems="center"
                justifyContent="center"
              >
                <Typography
                  variant="subtitle2"
                  textAlign="center"
                  color={isRejected ? 'error' : 'text.primary'}
                >
                  {distribution.supplierCompany.name}
                </Typography>
                {isRejected ? (
                  <Tooltip
                    title={
                      distribution.rejectionReason
                        ? t('distributions.rejectedWithReason', {
                            reason: distribution.rejectionReason,
                          })
                        : t('distributions.rejected')
                    }
                  >
                    <InfoOutlinedIcon
                      fontSize="small"
                      color="error"
                      aria-label={t('distributions.rejected')}
                    />
                  </Tooltip>
                ) : null}
              </Stack>
              {canDistribute ? (
                <Stack direction="row" spacing={0.25} justifyContent="center">
                  {canEditLines ? (
                    <Tooltip title={t('distributions.editLines')}>
                      <span>
                        <IconButton
                          size="small"
                          aria-label={t('distributions.editLines')}
                          disabled={!dirty || draftCount === 0}
                          onClick={() => setDistributionToSave(distribution)}
                        >
                          <EditOutlinedIcon fontSize="small" />
                        </IconButton>
                      </span>
                    </Tooltip>
                  ) : null}
                  {isRejected ? (
                    <Tooltip title={t('distributions.resend')}>
                      <IconButton
                        size="small"
                        color="error"
                        aria-label={t('distributions.resend')}
                        onClick={() => setDistributionToResend(distribution)}
                      >
                        <ReplayOutlinedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  ) : null}
                  <Tooltip title={t('distributions.remove')}>
                    <IconButton
                      size="small"
                      color="error"
                      aria-label={t('distributions.remove')}
                      onClick={() => setDistributionToRemove(distribution)}
                    >
                      <DeleteOutlineIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Stack>
              ) : null}
            </Stack>
          ),
          Cell: ({ row }) => {
            const checked = draftIds.has(row.original.id);
            return (
              <Checkbox
                size="small"
                checked={checked}
                disabled={!canEditLines}
                color={isRejected ? 'error' : 'primary'}
                sx={
                  isRejected
                    ? {
                        color: 'error.main',
                        '&.Mui-disabled': {
                          color: 'error.main',
                        },
                      }
                    : undefined
                }
                onChange={() =>
                  toggleDraftLine(distribution.id, row.original.id)
                }
                inputProps={{
                  'aria-label': t('distributions.toggleLine', {
                    supplier: distribution.supplierCompany.name,
                    line: row.original.lineNumber,
                  }),
                }}
              />
            );
          },
        };
      },
    );

    return [...baseColumns, ...supplierColumns];
    // eslint-disable-next-line react-hooks/exhaustive-deps -- draft helpers close over latest state via rebuild deps
  }, [canDistribute, distributions, draftLineIds, savedLineIdSets, t]);

  return (
    <Stack spacing={2}>
      <Typography variant="h6">{t('distributions.title')}</Typography>

      <ApiErrorAlert
        error={
          distributionsQuery.error ?? deleteState.error ?? distributeState.error
        }
      />

      {distributionsQuery.isLoading ? (
        <Typography color="text.secondary">
          {t('suppliersMatrix.loading')}
        </Typography>
      ) : requestLines.length === 0 ? (
        <Typography color="text.secondary">{t('empty.lines')}</Typography>
      ) : (
        <PaginatedTable
          columns={columns}
          data={pagedLines}
          rowCount={requestLines.length}
          pagination={pagination}
          onPaginationChange={setPagination}
          getRowId={(row) => row.id}
          isLoading={distributionsQuery.isLoading}
          isFetching={distributionsQuery.isFetching}
          renderBottomToolbarCustomActions={
            canDistribute
              ? () => (
                  <PermissionGate permission="manageRequests">
                    <Button
                      variant="outlined"
                      startIcon={<AddIcon />}
                      disabled={requestLines.length === 0}
                      onClick={() => setAddSupplierOpen(true)}
                    >
                      {t('actions.addSupplier')}
                    </Button>
                  </PermissionGate>
                )
              : undefined
          }
        />
      )}

      <RequestDistributeToSupplierDialog
        open={addSupplierOpen}
        companyId={companyId}
        requestId={requestId}
        requestLineIds={requestLines.map((line) => line.id)}
        excludeSupplierCompanyIds={distributions.map(
          (distribution) => distribution.supplierCompany.id,
        )}
        onClose={() => setAddSupplierOpen(false)}
      />

      <Dialog
        open={Boolean(distributionToSave)}
        onClose={() => setDistributionToSave(null)}
      >
        <DialogTitle>{t('distributions.confirmEditTitle')}</DialogTitle>
        <DialogContent>
          <Typography>
            {t('distributions.confirmEditMessage', {
              supplier: distributionToSave?.supplierCompany.name ?? '',
              count: distributionToSave
                ? (draftLineIds[distributionToSave.id] ?? []).length
                : 0,
            })}
          </Typography>
          <ApiErrorAlert error={distributeState.error} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDistributionToSave(null)}>
            {t('actions.cancel')}
          </Button>
          <Button
            variant="contained"
            disabled={
              distributeState.isLoading ||
              !distributionToSave ||
              (draftLineIds[distributionToSave.id] ?? []).length === 0
            }
            onClick={() => void handleSaveConfirm()}
          >
            {t('distributions.editLines')}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={Boolean(distributionToResend)}
        onClose={() => setDistributionToResend(null)}
      >
        <DialogTitle>{t('distributions.confirmResendTitle')}</DialogTitle>
        <DialogContent>
          <Typography>
            {t('distributions.confirmResendMessage', {
              supplier: distributionToResend?.supplierCompany.name ?? '',
            })}
          </Typography>
          <ApiErrorAlert error={distributeState.error} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDistributionToResend(null)}>
            {t('actions.cancel')}
          </Button>
          <Button
            variant="contained"
            disabled={distributeState.isLoading}
            onClick={() => void handleResendConfirm()}
          >
            {t('distributions.resend')}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={Boolean(distributionToRemove)}
        onClose={() => setDistributionToRemove(null)}
      >
        <DialogTitle>{t('distributions.confirmRemoveTitle')}</DialogTitle>
        <DialogContent>
          <Typography>
            {t('distributions.confirmRemoveMessage', {
              supplier: distributionToRemove?.supplierCompany.name ?? '',
            })}
          </Typography>
          <ApiErrorAlert error={deleteState.error} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDistributionToRemove(null)}>
            {t('actions.cancel')}
          </Button>
          <Button
            color="error"
            variant="contained"
            disabled={deleteState.isLoading}
            onClick={() => void handleRemoveConfirm()}
          >
            {t('distributions.remove')}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
