import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import type { SerializedError } from '@reduxjs/toolkit';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';

import { useLazyGetBillableLinesQuery } from '@/api/endpoints/requestsApi';
import { useCreateInvoiceMutation } from '@/api/endpoints/invoicesApi';
import { useAppSelector } from '@/hooks/useAppSelector';

export function useCreateInvoiceFromRequest() {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { t } = useTranslation('invoices');
  const companyId = useAppSelector((state) => state.auth.activeCompanyId);
  const [triggerBillableLines] = useLazyGetBillableLinesQuery();
  const [createInvoice, createState] = useCreateInvoiceMutation();
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<
    FetchBaseQueryError | SerializedError | undefined
  >(undefined);

  const createInvoiceFromRequest = useCallback(
    async (requestId: string) => {
      if (!companyId) {
        return;
      }

      setIsCreating(true);
      setError(undefined);

      try {
        const billable = await triggerBillableLines({
          companyId,
          requestId,
        }).unwrap();

        if (billable.lines.length === 0) {
          enqueueSnackbar(t('toast.noBillableLines'), { variant: 'warning' });
          setIsCreating(false);
          return;
        }

        const created = await createInvoice({
          companyId,
          materialRequestId: requestId,
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
      enqueueSnackbar,
      navigate,
      t,
      triggerBillableLines,
    ],
  );

  return {
    createInvoiceFromRequest,
    isCreating: isCreating || createState.isLoading,
    error,
  };
}
