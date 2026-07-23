import { useGetImportJobQuery } from '@/api/endpoints/importsApi';
import type { ImportJob } from '@/api/generated/models/importJob';
import { ImportJobStatus } from '@/api/generated/models/importJobStatus';

const POLLING_INTERVAL_MS = 1500;

const POLLING_STATUSES = new Set<ImportJob['status']>([
  ImportJobStatus.PENDING,
  ImportJobStatus.PARSING,
]);

interface UseImportJobPollingOptions {
  companyId: string;
  jobId: string | null;
  poll?: boolean;
  skip?: boolean;
}

export function useImportJobPolling({
  companyId,
  jobId,
  poll = false,
  skip = false,
}: UseImportJobPollingOptions) {
  const shouldSkip = skip || !companyId || !jobId;

  const query = useGetImportJobQuery(
    { companyId, jobId: jobId ?? '' },
    {
      skip: shouldSkip,
      pollingInterval: poll ? POLLING_INTERVAL_MS : 0,
    },
  );

  const job = query.data?.job;
  const status = job?.status;

  const isPolling = Boolean(poll && status && POLLING_STATUSES.has(status));
  const isReady = status === ImportJobStatus.PREVIEW_READY;
  const isFailed = status === ImportJobStatus.FAILED;
  const isCompleted =
    status === ImportJobStatus.COMPLETED ||
    status === ImportJobStatus.CONFIRMED;

  return {
    job,
    status,
    isPolling,
    isReady,
    isFailed,
    isCompleted,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error,
    refetch: query.refetch,
  };
}
