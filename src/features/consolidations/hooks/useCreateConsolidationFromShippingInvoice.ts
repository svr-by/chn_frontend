import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import type { SerializedError } from '@reduxjs/toolkit';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';

import {
  useCreateConsolidationMutation,
  useLazyGetConsolidatableShippingInvoicesQuery,
} from '@/api/endpoints/consolidationsApi';
import { useAppSelector } from '@/hooks/useAppSelector';

export function useCreateConsolidationFromShippingInvoice() {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { t } = useTranslation('consolidations');
  const companyId = useAppSelector((state) => state.auth.activeCompanyId);
  const [triggerConsolidatable] = useLazyGetConsolidatableShippingInvoicesQuery();
  const [createConsolidation, createState] = useCreateConsolidationMutation();
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<
    FetchBaseQueryError | SerializedError | undefined
  >(undefined);

  const createConsolidationFromShippingInvoice = useCallback(
    async (shippingInvoiceId: string) => {
      if (!companyId) {
        return;
      }

      setIsCreating(true);
      setError(undefined);

      try {
        const consolidatable = await triggerConsolidatable({ companyId }).unwrap();
        const isEligible = consolidatable.shippingInvoices.some(
          (invoice) => invoice.id === shippingInvoiceId,
        );

        if (!isEligible) {
          enqueueSnackbar(t('toast.notConsolidatable'), { variant: 'warning' });
          setIsCreating(false);
          return;
        }

        const created = await createConsolidation({
          companyId,
          shippingInvoiceIds: [shippingInvoiceId],
        }).unwrap();

        navigate(`/app/consolidations/${created.consolidation.id}`);
      } catch (createError) {
        setError(createError as FetchBaseQueryError | SerializedError);
      } finally {
        setIsCreating(false);
      }
    },
    [
      companyId,
      createConsolidation,
      enqueueSnackbar,
      navigate,
      t,
      triggerConsolidatable,
    ],
  );

  return {
    createConsolidationFromShippingInvoice,
    isCreating: isCreating || createState.isLoading,
    error,
  };
}
