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
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import ReplayOutlinedIcon from '@mui/icons-material/ReplayOutlined';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import type { MRT_ColumnDef, MRT_PaginationState } from 'material-react-table';
import { useTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';

import type { RequestDistribution } from '@/api/generated/models/requestDistribution';
import type { RequestLine } from '@/api/generated/models/requestLine';
import {
  useDeleteRequestDistributionMutation,
  useDistributeRequestMutation,
  useGetQuoteComparisonQuery,
  useGetRequestDistributionsQuery,
  useUpdateRequestDistributionMutation,
} from '@/api/endpoints/requestsApi';
import { ApiErrorAlert } from '@/components/feedback/apiErrorAlert/ApiErrorAlert';
import { PaginatedTable } from '@/components/tables/paginatedTable/PaginatedTable';
import { PermissionGate } from '@/components/auth/permissionGate/PermissionGate';
import { RequestDistributeToSupplierDialog } from '@/features/requests/components/requestSuppliersMatrix/RequestDistributeToSupplierDialog';
import { createRequestLineBaseColumns } from '@/features/requests/lib/requestLineTableColumns';
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

/** Non-draft supplier offers — lines that cannot be removed from distribution. */
function buildQuotedLineKeys(
  comparisonLines:
    | {
        requestLine: { id: string };
        offers: { supplierCompany: { id: string }; status: string }[];
      }[]
    | undefined,
): Set<string> {
  const keys = new Set<string>();
  for (const line of comparisonLines ?? []) {
    for (const offer of line.offers) {
      if (offer.status === 'DRAFT') {
        continue;
      }
      keys.add(`${offer.supplierCompany.id}:${line.requestLine.id}`);
    }
  }
  return keys;
}

/** Suppliers with at least one non-draft quote — distribution cannot be removed. */
function buildQuotedSupplierIds(quotedLineKeys: Set<string>): Set<string> {
  const ids = new Set<string>();
  for (const key of quotedLineKeys) {
    const separatorIndex = key.indexOf(':');
    if (separatorIndex > 0) {
      ids.add(key.slice(0, separatorIndex));
    }
  }
  return ids;
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

  const canManageDistributions =
    requestStatus !== 'CLOSED' && hasPermission('manageRequests');

  const distributionsQuery = useGetRequestDistributionsQuery(
    { companyId, requestId },
    { skip: !companyId || !requestId },
  );

  const comparisonQuery = useGetQuoteComparisonQuery(
    { companyId, requestId },
    { skip: !companyId || !requestId },
  );

  const quotedLineKeys = useMemo(
    () => buildQuotedLineKeys(comparisonQuery.data?.lines),
    [comparisonQuery.data?.lines],
  );

  const quotedSupplierIds = useMemo(
    () => buildQuotedSupplierIds(quotedLineKeys),
    [quotedLineKeys],
  );

  const [deleteDistribution, deleteState] =
    useDeleteRequestDistributionMutation();
  const [distributeRequest, distributeState] = useDistributeRequestMutation();
  const [updateDistribution, updateState] =
    useUpdateRequestDistributionMutation();

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

  async function savePendingDistribution(
    distribution: RequestDistribution,
    requestLineIds: string[],
  ) {
    await updateDistribution({
      companyId,
      requestId,
      distributionId: distribution.id,
      requestLineIds,
    }).unwrap();
    enqueueSnackbar(t('distributions.toast.updated'), { variant: 'success' });
  }

  async function resendDistribution(
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
      await savePendingDistribution(distributionToSave, requestLineIds);
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
      await resendDistribution(distributionToResend, requestLineIds);
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
    const baseColumns = createRequestLineBaseColumns(t);

    const supplierColumns: MRT_ColumnDef<RequestLine>[] = distributions.map(
      (distribution) => {
        const dirty = isDirty(distribution.id);
        const draftIds = new Set(draftLineIds[distribution.id] ?? []);
        const isRejected = distribution.status === 'REJECTED';
        const canEditDistributionLines =
          canManageDistributions &&
          (distribution.status === 'PENDING' || isRejected);
        const canSaveLines =
          canManageDistributions && distribution.status === 'PENDING';
        const savedLineIds =
          savedLineIdSets.get(distribution.id) ?? new Set<string>();
        const draftCount = draftIds.size;
        const hasSupplierQuotes = quotedSupplierIds.has(
          distribution.supplierCompany.id,
        );

        return {
          id: `distribution-${distribution.id}`,
          header: distribution.supplierCompany.name,
          size: 160,
          grow: false,
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
              {canManageDistributions ? (
                <Stack direction="row" spacing={0.25} justifyContent="center">
                  {canSaveLines ? (
                    <Tooltip title={t('distributions.saveLines')}>
                      <span>
                        <IconButton
                          size="small"
                          aria-label={t('distributions.saveLines')}
                          disabled={!dirty || draftCount === 0}
                          onClick={() => setDistributionToSave(distribution)}
                        >
                          <SaveOutlinedIcon fontSize="small" />
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
                  <Tooltip
                    title={
                      hasSupplierQuotes
                        ? t('distributions.cannotRemoveHasQuote')
                        : t('distributions.remove')
                    }
                  >
                    <span>
                      <IconButton
                        size="small"
                        color="error"
                        aria-label={t('distributions.remove')}
                        disabled={hasSupplierQuotes}
                        onClick={() => setDistributionToRemove(distribution)}
                      >
                        <DeleteOutlineIcon fontSize="small" />
                      </IconButton>
                    </span>
                  </Tooltip>
                </Stack>
              ) : null}
            </Stack>
          ),
          Cell: ({ row }) => {
            const checked = draftIds.has(row.original.id);
            const lockedByQuote =
              checked &&
              savedLineIds.has(row.original.id) &&
              quotedLineKeys.has(
                `${distribution.supplierCompany.id}:${row.original.id}`,
              );
            const checkboxDisabled = !canEditDistributionLines || lockedByQuote;

            const checkbox = (
              <Checkbox
                size="small"
                checked={checked}
                disabled={checkboxDisabled}
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

            return lockedByQuote ? (
              <Tooltip title={t('distributions.lineHasQuote')}>
                <span>{checkbox}</span>
              </Tooltip>
            ) : (
              checkbox
            );
          },
        };
      },
    );

    return [...baseColumns, ...supplierColumns];
    // eslint-disable-next-line react-hooks/exhaustive-deps -- draft helpers close over latest state via rebuild deps
  }, [
    canManageDistributions,
    distributions,
    draftLineIds,
    quotedLineKeys,
    quotedSupplierIds,
    savedLineIdSets,
    t,
  ]);

  return (
    <Stack spacing={2}>
      <ApiErrorAlert
        error={
          distributionsQuery.error ??
          deleteState.error ??
          distributeState.error ??
          updateState.error
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
          layoutMode="grid"
          isLoading={distributionsQuery.isLoading}
          isFetching={distributionsQuery.isFetching}
          renderBottomToolbarCustomActions={
            canManageDistributions
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
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {t('distributions.confirmEditWarning')}
          </Typography>
          <ApiErrorAlert error={updateState.error} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDistributionToSave(null)}>
            {t('actions.cancel')}
          </Button>
          <Button
            variant="contained"
            disabled={
              updateState.isLoading ||
              !distributionToSave ||
              (draftLineIds[distributionToSave.id] ?? []).length === 0
            }
            onClick={() => void handleSaveConfirm()}
          >
            {t('distributions.saveLines')}
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
