import { useEffect, useMemo } from 'react';

import { quotesApi, useListQuotesQuery } from '@/api/endpoints/quotesApi';
import { useAppDispatch } from '@/hooks/useAppDispatch';
import { useAppSelector } from '@/hooks/useAppSelector';

export function useQuoteLineSelectionMap(
  companyId: string,
  requestId: string,
) {
  const dispatch = useAppDispatch();

  const listQuery = useListQuotesQuery(
    {
      companyId,
      requestId,
      direction: 'outbound',
      limit: 100,
      offset: 0,
    },
    { skip: !companyId || !requestId },
  );

  const quoteIds = useMemo(
    () => listQuery.data?.quotes.map((quote) => quote.id) ?? [],
    [listQuery.data?.quotes],
  );

  useEffect(() => {
    if (!companyId || quoteIds.length === 0) {
      return;
    }

    const subscriptions = quoteIds.map((quoteId) =>
      dispatch(
        quotesApi.endpoints.getQuote.initiate({ companyId, quoteId }),
      ),
    );

    return () => {
      subscriptions.forEach((subscription) => subscription.unsubscribe());
    };
  }, [companyId, dispatch, quoteIds]);

  const selectionMap = useAppSelector((state) => {
    const map = new Map<string, string>();

    for (const quoteId of quoteIds) {
      const quote = quotesApi.endpoints.getQuote.select({
        companyId,
        quoteId,
      })(state).data?.quote;

      if (!quote?.lines) {
        continue;
      }

      for (const line of quote.lines) {
        if (line.selectedQuantity != null) {
          map.set(line.id, line.selectedQuantity);
        }
      }
    }

    return map;
  });

  const quotesLoading = useAppSelector((state) =>
    quoteIds.some(
      (quoteId) =>
        quotesApi.endpoints.getQuote.select({ companyId, quoteId })(state)
          .isLoading,
    ),
  );

  const isLoading = listQuery.isLoading || quotesLoading;

  return { selectionMap, isLoading };
}
