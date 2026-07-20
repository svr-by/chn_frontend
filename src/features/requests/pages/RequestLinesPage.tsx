import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Box,
  Button,
  Checkbox,
  Chip,
  Divider,
  Drawer,
  FormControl,
  FormControlLabel,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import FilterListIcon from '@mui/icons-material/FilterList';
import type { MRT_ColumnDef, MRT_PaginationState } from 'material-react-table';
import { useTranslation } from 'react-i18next';

import type { RequestLineListItem } from '@/api/generated/models/requestLineListItem';
import { GetCompaniesCompanyIdRequestLinesStatus } from '@/api/generated/models/getCompaniesCompanyIdRequestLinesStatus';
import type { GetCompaniesCompanyIdRequestLinesParams } from '@/api/generated/models/getCompaniesCompanyIdRequestLinesParams';
import type { GetCompaniesCompanyIdRequestLinesStatus as RequestLineStatusFilter } from '@/api/generated/models/getCompaniesCompanyIdRequestLinesStatus';
import { useListRequestLinesQuery } from '@/api/endpoints/requestsApi';
import { ApiErrorAlert } from '@/components/ApiErrorAlert';
import { DecimalDisplay } from '@/components/DecimalDisplay';
import { PaginatedTable } from '@/components/PaginatedTable';
import { StatusBadge } from '@/components/StatusBadge';
import { useAppSelector } from '@/hooks/useAppSelector';
import type { MaterialRequestStatus } from '@/types/api';

const PAGE_SIZE = 20;

type StatusFilter = RequestLineStatusFilter | 'ALL';

interface FilterState {
  q: string;
  status: StatusFilter;
  requestId: string;
  productId: string;
  createdByUserId: string;
  undistributed: boolean;
  withoutQuotes: boolean;
}

const EMPTY_FILTERS: FilterState = {
  q: '',
  status: 'ALL',
  requestId: '',
  productId: '',
  createdByUserId: '',
  undistributed: false,
  withoutQuotes: false,
};

function parseStatus(value: string | null): StatusFilter {
  if (
    value &&
    Object.values(GetCompaniesCompanyIdRequestLinesStatus).includes(
      value as RequestLineStatusFilter,
    )
  ) {
    return value as RequestLineStatusFilter;
  }

  return 'ALL';
}

function filtersFromSearchParams(searchParams: URLSearchParams): FilterState {
  return {
    q: searchParams.get('q') ?? '',
    status: parseStatus(searchParams.get('status')),
    requestId: searchParams.get('requestId') ?? '',
    productId: searchParams.get('productId') ?? '',
    createdByUserId: searchParams.get('createdByUserId') ?? '',
    undistributed: searchParams.get('undistributed') === 'true',
    withoutQuotes: searchParams.get('withoutQuotes') === 'true',
  };
}

function filtersToSearchParams(filters: FilterState) {
  const params = new URLSearchParams();

  if (filters.q.trim()) {
    params.set('q', filters.q.trim());
  }
  if (filters.status !== 'ALL') {
    params.set('status', filters.status);
  }
  if (filters.requestId.trim()) {
    params.set('requestId', filters.requestId.trim());
  }
  if (filters.productId.trim()) {
    params.set('productId', filters.productId.trim());
  }
  if (filters.createdByUserId.trim()) {
    params.set('createdByUserId', filters.createdByUserId.trim());
  }
  if (filters.undistributed) {
    params.set('undistributed', 'true');
  }
  if (filters.withoutQuotes) {
    params.set('withoutQuotes', 'true');
  }

  return params;
}

function getImportSku(line: RequestLineListItem) {
  const value = line.attributes?.importSku;
  return typeof value === 'string' && value.trim() ? value : null;
}

export function RequestLinesPage() {
  const { t } = useTranslation(['requests', 'trace']);
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const companyId = useAppSelector((state) => state.auth.activeCompanyId);

  const activeFilters = useMemo(
    () => filtersFromSearchParams(searchParams),
    [searchParams],
  );
  const [draftFilters, setDraftFilters] = useState<FilterState>(activeFilters);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [pagination, setPagination] = useState<MRT_PaginationState>({
    pageIndex: 0,
    pageSize: PAGE_SIZE,
  });

  useEffect(() => {
    setDraftFilters(activeFilters);
    setPagination((current) => ({ ...current, pageIndex: 0 }));
  }, [activeFilters]);

  const listParams = useMemo<GetCompaniesCompanyIdRequestLinesParams>(
    () => ({
      limit: pagination.pageSize,
      offset: pagination.pageIndex * pagination.pageSize,
      sortBy: 'requestCreatedAt',
      sortOrder: 'desc',
      ...(activeFilters.q.trim() ? { q: activeFilters.q.trim() } : {}),
      ...(activeFilters.status !== 'ALL' ? { status: activeFilters.status } : {}),
      ...(activeFilters.requestId.trim()
        ? { requestId: activeFilters.requestId.trim() }
        : {}),
      ...(activeFilters.productId.trim()
        ? { productId: activeFilters.productId.trim() }
        : {}),
      ...(activeFilters.createdByUserId.trim()
        ? { createdByUserId: activeFilters.createdByUserId.trim() }
        : {}),
      ...(activeFilters.undistributed ? { undistributed: 'true' } : {}),
      ...(activeFilters.withoutQuotes ? { withoutQuotes: 'true' } : {}),
    }),
    [activeFilters, pagination.pageIndex, pagination.pageSize],
  );

  const listQuery = useListRequestLinesQuery(
    {
      companyId: companyId ?? '',
      ...listParams,
    },
    { skip: !companyId },
  );

  const columns = useMemo<MRT_ColumnDef<RequestLineListItem>[]>(
    () => [
      {
        accessorKey: 'description',
        header: t('requestLines.columns.description'),
        Cell: ({ row }) => (
          <Stack spacing={0.5}>
            <Typography variant="body2">{row.original.description}</Typography>
            {row.original.product?.sku ?? getImportSku(row.original) ? (
              <Typography variant="caption" color="text.secondary">
                {row.original.product?.sku ?? getImportSku(row.original)}
              </Typography>
            ) : null}
          </Stack>
        ),
      },
      {
        id: 'quantity',
        header: t('requestLines.columns.quantity'),
        Cell: ({ row }) => (
          <>
            <DecimalDisplay value={row.original.quantity} component="span" />
            {row.original.unit ? ` ${row.original.unit}` : ''}
          </>
        ),
      },
      {
        id: 'request',
        header: t('requestLines.columns.request'),
        Cell: ({ row }) => (
          <Stack spacing={0.5}>
            <Typography variant="body2">
              {row.original.request.title ??
                t('requestLines.fallbackRequest', {
                  id: row.original.request.id.slice(0, 8),
                })}
            </Typography>
            <Stack direction="row" spacing={0.5} alignItems="center" flexWrap="wrap">
              {row.original.request.reference ? (
                <Typography variant="caption" color="text.secondary">
                  {row.original.request.reference}
                </Typography>
              ) : null}
              <StatusBadge
                status={row.original.request.status as MaterialRequestStatus}
              />
            </Stack>
          </Stack>
        ),
      },
      {
        id: 'createdBy',
        header: t('requestLines.columns.createdBy'),
        Cell: ({ row }) => row.original.request.createdByUserName ?? '—',
      },
      {
        id: 'pipeline',
        header: t('requestLines.columns.pipeline'),
        Cell: ({ row }) => {
          const { links } = row.original;
          const chips = [
            links.distributed ? t('requestLines.pipeline.distributed') : null,
            links.hasQuote ? t('requestLines.pipeline.quote') : null,
            links.hasSelection ? t('requestLines.pipeline.selection') : null,
            links.hasInvoice ? t('requestLines.pipeline.invoice') : null,
            links.hasShipping ? t('requestLines.pipeline.shipping') : null,
            links.hasConsolidation
              ? t('requestLines.pipeline.consolidation')
              : null,
          ].filter(Boolean);

          return (
            <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
              {links.stage ? (
                <Chip
                  label={t(`trace:pipelineStatus.${links.stage}`)}
                  size="small"
                  color="primary"
                  variant="outlined"
                />
              ) : null}
              {chips.length ? (
                chips.map((chip) => (
                  <Chip key={chip} label={chip} size="small" variant="outlined" />
                ))
              ) : (
                <Typography variant="body2" color="text.secondary">
                  {t('requestLines.pipeline.none')}
                </Typography>
              )}
            </Stack>
          );
        },
      },
      {
        accessorKey: 'createdAt',
        header: t('requestLines.columns.createdAt'),
        Cell: ({ cell }) => new Date(cell.getValue<string>()).toLocaleString(),
      },
      {
        accessorKey: 'updatedAt',
        header: t('requestLines.columns.updatedAt'),
        Cell: ({ cell }) => new Date(cell.getValue<string>()).toLocaleString(),
      },
    ],
    [t],
  );

  if (!companyId) {
    return null;
  }

  const items = listQuery.data?.items ?? [];
  const total = listQuery.data?.pagination.total ?? 0;
  const activeFilterCount = Array.from(filtersToSearchParams(activeFilters)).length;

  function applyFilters() {
    setSearchParams(filtersToSearchParams(draftFilters));
    setFiltersOpen(false);
  }

  function resetFilters() {
    setDraftFilters(EMPTY_FILTERS);
    setSearchParams({});
    setFiltersOpen(false);
  }

  return (
    <Stack spacing={3}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'stretch', sm: 'center' }}
        spacing={2}
      >
        <Box>
          <Typography variant="h5" component="h1">
            {t('requestLines.title')}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t('requestLines.subtitle')}
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<FilterListIcon />}
          onClick={() => setFiltersOpen(true)}
        >
          {activeFilterCount
            ? t('requestLines.filters.openWithCount', {
                count: activeFilterCount,
              })
            : t('requestLines.filters.open')}
        </Button>
      </Stack>

      <ApiErrorAlert error={listQuery.error} />

      {!listQuery.isLoading && items.length === 0 ? (
        <Typography color="text.secondary">{t('requestLines.empty')}</Typography>
      ) : (
        <PaginatedTable
          columns={columns}
          data={items}
          rowCount={total}
          pagination={pagination}
          onPaginationChange={setPagination}
          isLoading={listQuery.isLoading}
          isFetching={listQuery.isFetching}
          onRowClick={(row) => navigate(`/app/requests/${row.request.id}`)}
          getRowId={(row) => row.id}
        />
      )}

      <Drawer
        anchor="right"
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        PaperProps={{
          sx: { width: { xs: '100%', sm: 420 }, maxWidth: '100%' },
        }}
      >
        <Stack spacing={2} sx={{ p: 3, height: '100%' }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">{t('requestLines.filters.title')}</Typography>
            <IconButton
              aria-label={t('requestLines.filters.close')}
              onClick={() => setFiltersOpen(false)}
            >
              <CloseIcon />
            </IconButton>
          </Stack>
          <Divider />

          <TextField
            label={t('requestLines.filters.q')}
            value={draftFilters.q}
            onChange={(event) =>
              setDraftFilters((current) => ({ ...current, q: event.target.value }))
            }
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                applyFilters();
              }
            }}
            fullWidth
          />

          <FormControl fullWidth>
            <InputLabel id="request-lines-status-filter">
              {t('requestLines.filters.status')}
            </InputLabel>
            <Select
              labelId="request-lines-status-filter"
              label={t('requestLines.filters.status')}
              value={draftFilters.status}
              onChange={(event) =>
                setDraftFilters((current) => ({
                  ...current,
                  status: event.target.value as StatusFilter,
                }))
              }
            >
              <MenuItem value="ALL">{t('statusFilter.all')}</MenuItem>
              {Object.values(GetCompaniesCompanyIdRequestLinesStatus).map((status) => (
                <MenuItem key={status} value={status}>
                  {t(`statusFilter.${status.toLowerCase()}`, {
                    defaultValue: status,
                  })}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            label={t('requestLines.filters.requestId')}
            value={draftFilters.requestId}
            onChange={(event) =>
              setDraftFilters((current) => ({
                ...current,
                requestId: event.target.value,
              }))
            }
            fullWidth
          />
          <TextField
            label={t('requestLines.filters.productId')}
            value={draftFilters.productId}
            onChange={(event) =>
              setDraftFilters((current) => ({
                ...current,
                productId: event.target.value,
              }))
            }
            fullWidth
          />
          <TextField
            label={t('requestLines.filters.createdByUserId')}
            value={draftFilters.createdByUserId}
            onChange={(event) =>
              setDraftFilters((current) => ({
                ...current,
                createdByUserId: event.target.value,
              }))
            }
            fullWidth
          />

          <Stack>
            <FormControlLabel
              control={
                <Checkbox
                  checked={draftFilters.undistributed}
                  onChange={(event) =>
                    setDraftFilters((current) => ({
                      ...current,
                      undistributed: event.target.checked,
                    }))
                  }
                />
              }
              label={t('requestLines.filters.undistributed')}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={draftFilters.withoutQuotes}
                  onChange={(event) =>
                    setDraftFilters((current) => ({
                      ...current,
                      withoutQuotes: event.target.checked,
                    }))
                  }
                />
              }
              label={t('requestLines.filters.withoutQuotes')}
            />
          </Stack>

          <Box sx={{ flex: 1 }} />
          <Stack direction="row" spacing={1} justifyContent="flex-end">
            <Button onClick={resetFilters}>{t('requestLines.filters.reset')}</Button>
            <Button variant="contained" onClick={applyFilters}>
              {t('requestLines.filters.apply')}
            </Button>
          </Stack>
        </Stack>
      </Drawer>
    </Stack>
  );
}
