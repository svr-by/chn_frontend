import { useMemo, useState } from 'react';
import {
  Box,
  Button,
  Chip,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import type { MRT_ColumnDef, MRT_PaginationState } from 'material-react-table';
import { useTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';

import type { Product } from '@/api/generated/models/product';
import { useListProductsQuery } from '@/api/endpoints/productsApi';
import { ApiErrorAlert } from '@/components/ApiErrorAlert';
import { PaginatedTable } from '@/components/PaginatedTable';
import { PermissionGate } from '@/components/PermissionGate';
import { ProductFormDialog } from '@/features/products/components/ProductFormDialog';
import { useAppSelector } from '@/hooks/useAppSelector';
import { PageShell } from '@/layouts/PageShell';

const PAGE_SIZE = 20;

type ActiveFilter = 'all' | 'true' | 'false';

export function ProductsPage() {
  const { t } = useTranslation('products');
  const { enqueueSnackbar } = useSnackbar();
  const companyId = useAppSelector((state) => state.auth.activeCompanyId);

  const [pagination, setPagination] = useState<MRT_PaginationState>({
    pageIndex: 0,
    pageSize: PAGE_SIZE,
  });
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<ActiveFilter>('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const listQuery = useListProductsQuery(
    {
      companyId: companyId ?? '',
      limit: pagination.pageSize,
      offset: pagination.pageIndex * pagination.pageSize,
      ...(searchQuery ? { q: searchQuery } : {}),
      ...(activeFilter !== 'all' ? { isActive: activeFilter } : {}),
    },
    { skip: !companyId },
  );

  const columns = useMemo<MRT_ColumnDef<Product>[]>(
    () => [
      {
        accessorKey: 'name',
        header: t('columns.name'),
      },
      {
        accessorKey: 'sku',
        header: t('columns.sku'),
        Cell: ({ cell }) => cell.getValue<string | null>() ?? '—',
      },
      {
        accessorKey: 'unit',
        header: t('columns.unit'),
        Cell: ({ cell }) => cell.getValue<string | null>() ?? '—',
      },
      {
        accessorKey: 'isActive',
        header: t('columns.isActive'),
        Cell: ({ cell }) => (
          <Chip
            label={
              cell.getValue<boolean>()
                ? t('filter.active')
                : t('filter.inactive')
            }
            size="small"
            color={cell.getValue<boolean>() ? 'success' : 'default'}
          />
        ),
      },
      {
        accessorKey: 'updatedAt',
        header: t('columns.updatedAt'),
        Cell: ({ cell }) =>
          new Date(cell.getValue<string>()).toLocaleDateString(),
      },
      {
        id: 'actions',
        header: t('columns.actions'),
        Cell: ({ row }) => (
          <PermissionGate permission="manageProducts">
            <Button
              size="small"
              onClick={(event) => {
                event.stopPropagation();
                setEditingProduct(row.original);
                setDialogOpen(true);
              }}
            >
              {t('actions.edit')}
            </Button>
          </PermissionGate>
        ),
      },
    ],
    [t],
  );

  if (!companyId) {
    return null;
  }

  const products = listQuery.data?.products ?? [];
  const total = listQuery.data?.pagination.total ?? 0;

  function handleSearchSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSearchQuery(searchInput.trim());
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  }

  function handleDialogClose() {
    setDialogOpen(false);
    setEditingProduct(null);
  }

  function handleDialogSuccess() {
    enqueueSnackbar(editingProduct ? t('toast.updated') : t('toast.created'), {
      variant: 'success',
    });
  }

  return (
    <PageShell maxWidth="xl">
      <Stack spacing={3}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'stretch', sm: 'center' }}
          spacing={2}
        >
          <Box>
            <Typography variant="h5" component="h1">
              {t('title')}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t('subtitle')}
            </Typography>
          </Box>
          <PermissionGate permission="manageProducts">
            <Button
              variant="contained"
              onClick={() => {
                setEditingProduct(null);
                setDialogOpen(true);
              }}
            >
              {t('actions.create')}
            </Button>
          </PermissionGate>
        </Stack>

        <ApiErrorAlert error={listQuery.error} />

        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          component="form"
          onSubmit={handleSearchSubmit}
        >
          <TextField
            label={t('search.label')}
            placeholder={t('search.placeholder')}
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            size="small"
            sx={{ minWidth: 240 }}
          />
          <Button type="submit" variant="outlined">
            {t('search.submit')}
          </Button>
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel id="product-active-filter">
              {t('filter.label')}
            </InputLabel>
            <Select
              labelId="product-active-filter"
              label={t('filter.label')}
              value={activeFilter}
              onChange={(event) => {
                setActiveFilter(event.target.value as ActiveFilter);
                setPagination((prev) => ({ ...prev, pageIndex: 0 }));
              }}
            >
              <MenuItem value="all">{t('filter.all')}</MenuItem>
              <MenuItem value="true">{t('filter.active')}</MenuItem>
              <MenuItem value="false">{t('filter.inactive')}</MenuItem>
            </Select>
          </FormControl>
        </Stack>

        {!listQuery.isLoading && products.length === 0 ? (
          <Typography color="text.secondary">{t('empty.list')}</Typography>
        ) : (
          <PaginatedTable
            columns={columns}
            data={products}
            rowCount={total}
            pagination={pagination}
            onPaginationChange={setPagination}
            isLoading={listQuery.isLoading}
            isFetching={listQuery.isFetching}
            getRowId={(row) => row.id}
          />
        )}

        <ProductFormDialog
          open={dialogOpen}
          onClose={handleDialogClose}
          companyId={companyId}
          product={editingProduct}
          onSuccess={handleDialogSuccess}
        />
      </Stack>
    </PageShell>
  );
}
