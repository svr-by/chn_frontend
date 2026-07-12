import { describe, expect, it, vi } from 'vitest';
import { renderHook } from '@testing-library/react';

import { useGetExportJobQuery } from '@/api/endpoints/integrationApi';
import { useExportJobPolling } from '@/hooks/useExportJobPolling';
import { createExportJob, COMPANY_ID, EXPORT_JOB_ID } from '@/test/fixtures';

vi.mock('@/api/endpoints/integrationApi', () => ({
  useGetExportJobQuery: vi.fn(),
}));

const mockedUseGetExportJobQuery = vi.mocked(useGetExportJobQuery);

describe('useExportJobPolling', () => {
  it('reports polling while job is processing', () => {
    mockedUseGetExportJobQuery.mockReturnValue({
      data: { job: createExportJob({ status: 'PROCESSING' }) },
      isLoading: false,
      isFetching: true,
      error: undefined,
      refetch: vi.fn(),
    } as ReturnType<typeof useGetExportJobQuery>);

    const { result } = renderHook(() =>
      useExportJobPolling({
        companyId: COMPANY_ID,
        jobId: EXPORT_JOB_ID,
        poll: true,
      }),
    );

    expect(result.current.isPolling).toBe(true);
    expect(result.current.isCompleted).toBe(false);
    expect(result.current.isFailed).toBe(false);
  });

  it('reports completed and failed terminal states', () => {
    mockedUseGetExportJobQuery.mockReturnValue({
      data: { job: createExportJob({ status: 'COMPLETED' }) },
      isLoading: false,
      isFetching: false,
      error: undefined,
      refetch: vi.fn(),
    } as ReturnType<typeof useGetExportJobQuery>);

    const { result, rerender } = renderHook(() =>
      useExportJobPolling({
        companyId: COMPANY_ID,
        jobId: EXPORT_JOB_ID,
        poll: true,
      }),
    );

    expect(result.current.isCompleted).toBe(true);
    expect(result.current.isPolling).toBe(false);

    mockedUseGetExportJobQuery.mockReturnValue({
      data: {
        job: createExportJob({
          status: 'FAILED',
          errorMessage: 'Worker unavailable',
        }),
      },
      isLoading: false,
      isFetching: false,
      error: undefined,
      refetch: vi.fn(),
    } as ReturnType<typeof useGetExportJobQuery>);

    rerender();
    expect(result.current.isFailed).toBe(true);
    expect(result.current.job?.errorMessage).toBe('Worker unavailable');
  });
});
