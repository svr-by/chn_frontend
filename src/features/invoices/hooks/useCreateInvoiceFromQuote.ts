import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import type { SerializedError } from '@reduxjs/toolkit';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';

import { quotesApi, useLazyGetQuoteBillableLinesQuery } from '@/api/endpoints/quotesApi';
import { useCreateInvoiceMutation } from '@/api/endpoints/invoicesApi';
import { useAppDispatch } from '@/hooks/useAppDispatch';
import { useAppSelector } from '@/hooks/useAppSelector';

export function useCreateInvoiceFromQuote() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const { t } = useTranslation('invoices');
  const companyId = useAppSelector((state) => state.auth.activeCompanyId);
  const [triggerBillableLines] = useLazyGetQuoteBillableLinesQuery();
  const [createInvoice, createState] = useCreateInvoiceMutation();
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<
    FetchBaseQueryError | SerializedError | undefined
  >(undefined);

  const createInvoiceFromQuote = useCallback(
    async (materialRequestId: string, quoteId?: string) => {
      if (!companyId) {
        return;
      }

      setIsCreating(true);
      setError(undefined);

      try {
        let resolvedQuoteId = quoteId;

        if (!resolvedQuoteId) {
          const listResult = await dispatch(
            quotesApi.endpoints.listQuotes.initiate({
              companyId,
              requestId: materialRequestId,
              direction: 'outbound',
              limit: 1,
              offset: 0,
            }),
          ).unwrap();
          resolvedQuoteId = listResult.quotes[0]?.id;
        }

        if (!resolvedQuoteId) {
          enqueueSnackbar(t('toast.noBillableLines'), { variant: 'warning' });
          return;
        }

        const billable = await triggerBillableLines({
          companyId,
          quoteId: resolvedQuoteId,
          materialRequestId,
        }).unwrap();

        if (billable.lines.length === 0) {
          enqueueSnackbar(t('toast.noBillableLines'), { variant: 'warning' });
          return;
        }

        const created = await createInvoice({
          companyId,
          materialRequestId,
          quoteId: resolvedQuoteId,
        }).unwrap();

        navigate(`/app/invoices/${created.invoice.id}`);
      } catch (createError) {
        setError(createError as FetchBaseQueryError | SerializedError);
      } finally {
        setIsCreating(false);
      }
    },
    [
      companyId,
      createInvoice,
      dispatch,
      enqueueSnackbar,
      navigate,
      t,
      triggerBillableLines,
    ],
  );

  return {
    createInvoiceFromQuote,
    isCreating: isCreating || createState.isLoading,
    error,
  };
}
