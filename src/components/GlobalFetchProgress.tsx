import { LinearProgress } from '@mui/material';

import { baseApi } from '@/api/baseApi';
import { useAppSelector } from '@/hooks/useAppSelector';

export function GlobalFetchProgress() {
  const isFetching = useAppSelector((state) => {
    const apiState = state[baseApi.reducerPath];
    if (!apiState) {
      return false;
    }

    const queriesPending = Object.values(apiState.queries).some(
      (query) => query?.status === 'pending',
    );
    const mutationsPending = Object.values(apiState.mutations).some(
      (mutation) => mutation?.status === 'pending',
    );

    return queriesPending || mutationsPending;
  });

  if (!isFetching) {
    return null;
  }

  return (
    <LinearProgress
      sx={{
        position: 'fixed',
        top: (theme) => (theme.mixins.toolbar.minHeight ?? 0) as number + 4,
        left: 0,
        right: 0,
        zIndex: (theme) => theme.zIndex.drawer + 2,
      }}
    />
  );
}
