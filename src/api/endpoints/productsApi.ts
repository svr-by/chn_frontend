import {
  getGetCompaniesCompanyIdProductsProductIdUrl,
  getGetCompaniesCompanyIdProductsUrl,
  getPatchCompaniesCompanyIdProductsProductIdUrl,
  getPostCompaniesCompanyIdProductsUrl,
} from '@/api/generated/endpoints';
import type {
  GetCompaniesCompanyIdProducts200,
  GetCompaniesCompanyIdProductsParams,
  GetCompaniesCompanyIdProductsProductId200,
  PatchCompaniesCompanyIdProductsProductId200,
  PatchCompaniesCompanyIdProductsProductIdBody,
  PostCompaniesCompanyIdProducts201,
  PostCompaniesCompanyIdProductsBody,
} from '@/api/generated/models';
import { baseApi } from '@/api/baseApi';

type CompanyScopedArgs<T = void> = T extends void
  ? { companyId: string }
  : { companyId: string } & T;

function productTags(companyId: string, productId?: string) {
  const tags = [{ type: 'Products' as const, id: companyId }];
  if (productId) {
    tags.push({ type: 'Products' as const, id: `${companyId}-${productId}` });
  }
  return tags;
}

export const productsApi = baseApi.injectEndpoints({
  overrideExisting: false,
  endpoints: (builder) => ({
    listProducts: builder.query<
      GetCompaniesCompanyIdProducts200,
      CompanyScopedArgs<GetCompaniesCompanyIdProductsParams>
    >({
      query: ({ companyId, ...params }) => ({
        url: getGetCompaniesCompanyIdProductsUrl(companyId),
        params,
      }),
      providesTags: (_result, _error, { companyId }) => [
        { type: 'Products', id: companyId },
      ],
    }),
    getProduct: builder.query<
      GetCompaniesCompanyIdProductsProductId200,
      { companyId: string; productId: string }
    >({
      query: ({ companyId, productId }) => ({
        url: getGetCompaniesCompanyIdProductsProductIdUrl(companyId, productId),
      }),
      providesTags: (_result, _error, { companyId, productId }) => [
        { type: 'Products', id: `${companyId}-${productId}` },
      ],
    }),
    createProduct: builder.mutation<
      PostCompaniesCompanyIdProducts201,
      CompanyScopedArgs<PostCompaniesCompanyIdProductsBody>
    >({
      query: ({ companyId, ...body }) => ({
        url: getPostCompaniesCompanyIdProductsUrl(companyId),
        method: 'POST',
        body,
      }),
      invalidatesTags: (_result, _error, { companyId }) =>
        productTags(companyId),
    }),
    updateProduct: builder.mutation<
      PatchCompaniesCompanyIdProductsProductId200,
      {
        companyId: string;
        productId: string;
      } & PatchCompaniesCompanyIdProductsProductIdBody
    >({
      query: ({ companyId, productId, ...body }) => ({
        url: getPatchCompaniesCompanyIdProductsProductIdUrl(
          companyId,
          productId,
        ),
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (_result, _error, { companyId, productId }) =>
        productTags(companyId, productId),
    }),
  }),
});

export const {
  useListProductsQuery,
  useGetProductQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
} = productsApi;
