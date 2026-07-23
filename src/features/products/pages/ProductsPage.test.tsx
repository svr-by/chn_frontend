import { describe, expect, it, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';

import { useGetMeQuery } from '@/api/endpoints/authApi';
import {
  useCreateProductMutation,
  useListProductsQuery,
  useUpdateProductMutation,
} from '@/api/endpoints/productsApi';
import { ProductsPage } from '@/features/products/pages/ProductsPage';
import {
  COMPANY_ID,
  createMembership,
  createProduct,
  createTestUser,
} from '@/test/fixtures';
import { renderWithProviders } from '@/test/render';

vi.mock('@/api/endpoints/authApi', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('@/api/endpoints/authApi')>();
  return {
    ...actual,
    useGetMeQuery: vi.fn(),
  };
});

vi.mock('@/api/endpoints/productsApi', () => ({
  useListProductsQuery: vi.fn(),
  useCreateProductMutation: vi.fn(),
  useUpdateProductMutation: vi.fn(),
  useGetProductQuery: vi.fn(),
}));

const mockedUseGetMeQuery = vi.mocked(useGetMeQuery);
const mockedUseListProductsQuery = vi.mocked(useListProductsQuery);
const mockedUseCreateProductMutation = vi.mocked(useCreateProductMutation);
const mockedUseUpdateProductMutation = vi.mocked(useUpdateProductMutation);

function mockMutationHook(mock: ReturnType<typeof vi.fn>) {
  return [mock, { isLoading: false, reset: vi.fn() }] as const;
}

describe('ProductsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockedUseListProductsQuery.mockReturnValue({
      data: {
        products: [createProduct()],
        pagination: { total: 1, limit: 20, offset: 0 },
      },
      isLoading: false,
      isFetching: false,
      refetch: vi.fn(),
    } as ReturnType<typeof useListProductsQuery>);

    mockedUseCreateProductMutation.mockReturnValue(
      mockMutationHook(vi.fn()) as ReturnType<typeof useCreateProductMutation>,
    );
    mockedUseUpdateProductMutation.mockReturnValue(
      mockMutationHook(vi.fn()) as ReturnType<typeof useUpdateProductMutation>,
    );
  });

  it('renders product list', () => {
    mockedUseGetMeQuery.mockReturnValue({
      data: {
        user: createTestUser({
          memberships: [
            createMembership({
              effectivePermissions: ['viewProducts', 'manageProducts'],
            }),
          ],
        }),
      },
      isLoading: false,
      isFetching: false,
      refetch: vi.fn(),
    } as ReturnType<typeof useGetMeQuery>);

    renderWithProviders(<ProductsPage />, {
      preloadedState: { auth: { activeCompanyId: COMPANY_ID } as never },
      route: '/app/products',
    });

    expect(screen.getByText('Test Product')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Add product' }),
    ).toBeInTheDocument();
  });

  it('hides create button without manageProducts', () => {
    mockedUseGetMeQuery.mockReturnValue({
      data: {
        user: createTestUser({
          memberships: [
            createMembership({
              effectivePermissions: ['viewProducts'],
            }),
          ],
        }),
      },
      isLoading: false,
      isFetching: false,
      refetch: vi.fn(),
    } as ReturnType<typeof useGetMeQuery>);

    renderWithProviders(<ProductsPage />, {
      preloadedState: { auth: { activeCompanyId: COMPANY_ID } as never },
      route: '/app/products',
    });

    expect(screen.getByText('Test Product')).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Add product' }),
    ).not.toBeInTheDocument();
  });
});
