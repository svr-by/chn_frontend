import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';

import type { PatchCompaniesCompanyIdQuotesQuoteIdBody } from '@/api/generated/models/patchCompaniesCompanyIdQuotesQuoteIdBody';
import type { SupplierQuote } from '@/api/generated/models/supplierQuote';
import { useUpdateQuoteMutation } from '@/api/endpoints/quotesApi';

export function useQuoteHeaderSave(companyId: string, quote: SupplierQuote) {
  const { t } = useTranslation('quotes');
  const { enqueueSnackbar } = useSnackbar();
  const [updateQuote, updateState] = useUpdateQuoteMutation();

  const save = useCallback(
    async (patch: PatchCompaniesCompanyIdQuotesQuoteIdBody): Promise<void> => {
      await updateQuote({
        companyId,
        quoteId: quote.id,
        materialRequestId: quote.materialRequest?.id,
        ...patch,
      }).unwrap();
      enqueueSnackbar(t('toast.updated'), { variant: 'success' });
    },
    [
      companyId,
      enqueueSnackbar,
      quote.id,
      quote.materialRequest?.id,
      t,
      updateQuote,
    ],
  );

  return { save, error: updateState.error };
}
