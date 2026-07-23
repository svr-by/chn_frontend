import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import type { SerializedError } from '@reduxjs/toolkit';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';

import { useLazyGetShippableLinesQuery } from '@/api/endpoints/invoicesApi';
import { useCreateShippingInvoiceMutation } from '@/api/endpoints/shippingInvoicesApi';
import { useAppSelector } from '@/hooks/useAppSelector';

export function useCreateShippingInvoiceFromInvoice() {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { t } = useTranslation('shipping');
  const companyId = useAppSelector((state) => state.auth.activeCompanyId);
  const [triggerShippableLines] = useLazyGetShippableLinesQuery();
  const [createShippingInvoice, createState] =
    useCreateShippingInvoiceMutation();
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<
    FetchBaseQueryError | SerializedError | undefined
  >(undefined);

  const createShippingInvoiceFromInvoice = useCallback(
    async (invoiceId: string) => {
      if (!companyId) {
        return;
      }

      setIsCreating(true);
      setError(undefined);

      try {
        const shippable = await triggerShippableLines({
          companyId,
          invoiceId,
        }).unwrap();

        if (shippable.lines.length === 0) {
          enqueueSnackbar(t('toast.noShippableLines'), { variant: 'warning' });
          setIsCreating(false);
          return;
        }

        const created = await createShippingInvoice({
          companyId,
          supplierInvoiceId: invoiceId,
        }).unwrap();

        navigate(`/app/shipping-invoices/${created.shippingInvoice.id}`);
      } catch (createError) {
        setError(createError as FetchBaseQueryError | SerializedError);
      } finally {
        setIsCreating(false);
      }
    },
    [
      companyId,
      createShippingInvoice,
      enqueueSnackbar,
      navigate,
      t,
      triggerShippableLines,
    ],
  );

  return {
    createShippingInvoiceFromInvoice,
    isCreating: isCreating || createState.isLoading,
    error,
  };
}
