import { useGetExportJobQuery } from '@/api/endpoints/integrationApi';
import type { ExportJob } from '@/api/generated/models/exportJob';
import { ExportJobStatus } from '@/api/generated/models/exportJobStatus';

const POLLING_INTERVAL_MS = 1500;

const POLLING_STATUSES = new Set<ExportJob['status']>([
  ExportJobStatus.PENDING,
  ExportJobStatus.PROCESSING,
]);

interface UseExportJobPollingOptions {
  companyId: string;
  jobId: string | null;
  poll?: boolean;
  skip?: boolean;
}

export function useExportJobPolling({
  companyId,
  jobId,
  poll = false,
  skip = false,
}: UseExportJobPollingOptions) {
  const shouldSkip = skip || !companyId || !jobId;

  const query = useGetExportJobQuery(
    { companyId, jobId: jobId ?? '' },
    {
      skip: shouldSkip,
      pollingInterval: poll ? POLLING_INTERVAL_MS : 0,
    },
  );

  const job = query.data?.job;
  const status = job?.status;

  const isPolling = Boolean(
    poll && status && POLLING_STATUSES.has(status),
  );
  const isCompleted = status === ExportJobStatus.COMPLETED;
  const isFailed = status === ExportJobStatus.FAILED;

  return {
    job,
    status,
    isPolling,
    isCompleted,
    isFailed,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error,
    refetch: query.refetch,
  };
}
