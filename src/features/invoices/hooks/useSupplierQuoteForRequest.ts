import { useMemo } from 'react';

import { useListQuotesQuery } from '@/api/endpoints/quotesApi';

export function useSupplierQuoteForRequest(
  companyId: string,
  materialRequestId: string | undefined,
  enabled = true,
) {
  const quotesQuery = useListQuotesQuery(
    {
      companyId,
      requestId: materialRequestId ?? '',
      direction: 'outbound',
      limit: 1,
      offset: 0,
    },
    { skip: !companyId || !materialRequestId || !enabled },
  );

  const quoteId = useMemo(
    () => quotesQuery.data?.quotes[0]?.id,
    [quotesQuery.data?.quotes],
  );

  return {
    quoteId,
    isLoading: quotesQuery.isLoading,
  };
}
