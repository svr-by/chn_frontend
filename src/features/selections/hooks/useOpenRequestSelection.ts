import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import type { SerializedError } from '@reduxjs/toolkit';

import { useLazyGetRequestSelectionQuery } from '@/api/endpoints/requestsApi';
import { useCreateSelectionMutation } from '@/api/endpoints/selectionsApi';
import { useAppSelector } from '@/hooks/useAppSelector';

function isNotFoundError(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'status' in error &&
    (error as FetchBaseQueryError).status === 404
  );
}

export function useOpenRequestSelection() {
  const navigate = useNavigate();
  const companyId = useAppSelector((state) => state.auth.activeCompanyId);
  const [triggerGetSelection] = useLazyGetRequestSelectionQuery();
  const [createSelection, createState] = useCreateSelectionMutation();
  const [isOpening, setIsOpening] = useState(false);
  const [error, setError] = useState<
    FetchBaseQueryError | SerializedError | undefined
  >(undefined);

  const openRequestSelection = useCallback(
    async (requestId: string) => {
      if (!companyId) {
        return;
      }

      setIsOpening(true);
      setError(undefined);

      try {
        const existing = await triggerGetSelection({
          companyId,
          requestId,
        }).unwrap();

        navigate(`/app/selections/${existing.selection.id}`);
        return;
      } catch (getError) {
        if (!isNotFoundError(getError)) {
          setError(getError as FetchBaseQueryError | SerializedError);
          setIsOpening(false);
          return;
        }
      }

      try {
        const created = await createSelection({
          companyId,
          requestId,
        }).unwrap();

        navigate(`/app/selections/${created.selection.id}`);
      } catch (createError) {
        setError(createError as FetchBaseQueryError | SerializedError);
      } finally {
        setIsOpening(false);
      }
    },
    [companyId, createSelection, navigate, triggerGetSelection],
  );

  return {
    openRequestSelection,
    isOpening: isOpening || createState.isLoading,
    error,
  };
}
