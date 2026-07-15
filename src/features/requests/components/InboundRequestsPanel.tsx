import { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography,
} from '@mui/material';
import type { MRT_ColumnDef, MRT_PaginationState } from 'material-react-table';
import { useTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';

import type { InboundMaterialRequest } from '@/api/generated/models/inboundMaterialRequest';
import type { MaterialRequestStatus } from '@/types/api';
import { useCreateQuoteMutation, useListQuotesQuery } from '@/api/endpoints/quotesApi';
import { useListInboundRequestsQuery } from '@/api/endpoints/requestsApi';
import { ApiErrorAlert } from '@/components/ApiErrorAlert';
import { PaginatedTable } from '@/components/PaginatedTable';
import { PermissionGate } from '@/components/PermissionGate';
import { StatusBadge } from '@/components/StatusBadge';

const PAGE_SIZE = 20;

const STATUS_OPTIONS: Array<MaterialRequestStatus | 'ALL'> = [
  'ALL',
  'SUBMITTED',
  'QUOTING',
  'PARTIALLY_ORDERED',
  'ORDERED',
  'CLOSED',
];

interface InboundRequestsPanelProps {
  companyId: string;
}

export function InboundRequestsPanel({ companyId }: InboundRequestsPanelProps) {
  const { t } = useTranslation('requests');
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const [pagination, setPagination] = useState<MRT_PaginationState>({
    pageIndex: 0,
    pageSize: PAGE_SIZE,
  });
  const [statusFilter, setStatusFilter] = useState<MaterialRequestStatus | 'ALL'>(
    'ALL',
  );
  const [creatingRequestId, setCreatingRequestId] = useState<string | null>(null);

  const listQuery = useListInboundRequestsQuery(
    {
      companyId,
      limit: pagination.pageSize,
      offset: pagination.pageIndex * pagination.pageSize,
      ...(statusFilter !== 'ALL' ? { status: statusFilter } : {}),
    },
    { skip: !companyId },
  );

  const [createQuote, createState] = useCreateQuoteMutation();

  const handleCreateQuote = useCallback(
    async (requestId: string) => {
      setCreatingRequestId(requestId);
      try {
        const result = await createQuote({ companyId, requestId }).unwrap();
        enqueueSnackbar(t('inbound.toast.quoteCreated'), { variant: 'success' });
        navigate(`/app/quotes/${result.quote.id}`);
      } catch {
        // ApiErrorAlert handles display at page level if needed
      } finally {
        setCreatingRequestId(null);
      }
    },
    [companyId, createQuote, enqueueSnackbar, navigate, t],
  );

  const columns = useMemo<MRT_ColumnDef<InboundMaterialRequest>[]>(
    () => [
      {
        id: 'buyer',
        header: t('inbound.columns.buyer'),
        Cell: ({ row }) => row.original.buyerCompany.name,
      },
      {
        accessorKey: 'title',
        header: t('columns.title'),
        Cell: ({ cell }) => cell.getValue<string | null>() ?? '—',
      },
      {
        accessorKey: 'status',
        header: t('columns.status'),
        Cell: ({ cell }) => (
          <StatusBadge status={cell.getValue<MaterialRequestStatus>()} />
        ),
      },
      {
        accessorKey: 'distributedAt',
        header: t('inbound.columns.distributedAt'),
        Cell: ({ cell }) => {
          const value = cell.getValue<string | null>();
          return value ? new Date(value).toLocaleString() : '—';
        },
      },
      {
        id: 'actions',
        header: t('columns.actions'),
        Cell: ({ row }) => (
          <InboundRequestActions
            requestId={row.original.id}
            companyId={companyId}
            isCreating={creatingRequestId === row.original.id}
            onCreateQuote={() => void handleCreateQuote(row.original.id)}
            onOpenQuote={(quoteId) => navigate(`/app/quotes/${quoteId}`)}
          />
        ),
      },
    ],
    [t, companyId, creatingRequestId, handleCreateQuote, navigate],
  );

  const requests = listQuery.data?.requests ?? [];
  const total = listQuery.data?.pagination.total ?? 0;

  return (
    <>
      <ApiErrorAlert error={listQuery.error ?? createState.error} />

      <FormControl size="small" sx={{ minWidth: 200, mb: 3 }}>
        <InputLabel id="inbound-status-filter">{t('statusFilter.label')}</InputLabel>
        <Select
          labelId="inbound-status-filter"
          label={t('statusFilter.label')}
          value={statusFilter}
          onChange={(event) => {
            setStatusFilter(event.target.value as MaterialRequestStatus | 'ALL');
            setPagination((prev) => ({ ...prev, pageIndex: 0 }));
          }}
        >
          {STATUS_OPTIONS.map((status) => (
            <MenuItem key={status} value={status}>
              {status === 'ALL'
                ? t('statusFilter.all')
                : t(`statusFilter.${status.toLowerCase()}`, {
                    defaultValue: status,
                  })}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {!listQuery.isLoading && requests.length === 0 ? (
        <Typography color="text.secondary">{t('inbound.empty.list')}</Typography>
      ) : (
        <PaginatedTable
          columns={columns}
          data={requests}
          rowCount={total}
          pagination={pagination}
          onPaginationChange={setPagination}
          isLoading={listQuery.isLoading}
          isFetching={listQuery.isFetching}
          getRowId={(row) => row.id}
        />
      )}
    </>
  );
}

interface InboundRequestActionsProps {
  requestId: string;
  companyId: string;
  isCreating: boolean;
  onCreateQuote: () => void;
  onOpenQuote: (quoteId: string) => void;
}

function InboundRequestActions({
  requestId,
  companyId,
  isCreating,
  onCreateQuote,
  onOpenQuote,
}: InboundRequestActionsProps) {
  const { t } = useTranslation('requests');

  const quotesQuery = useListQuotesQuery(
    { companyId, requestId, limit: 1, offset: 0 },
    { skip: !companyId || !requestId },
  );

  const existingQuote = quotesQuery.data?.quotes[0];

  if (existingQuote) {
    return (
      <Button size="small" onClick={() => onOpenQuote(existingQuote.id)}>
        {t('inbound.actions.openQuote')}
      </Button>
    );
  }

  return (
    <PermissionGate permission="manageQuotes">
      <Button
        size="small"
        variant="contained"
        onClick={onCreateQuote}
        disabled={isCreating}
      >
        {t('inbound.actions.createQuote')}
      </Button>
    </PermissionGate>
  );
}
