import { describe, expect, it, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router-dom';

import { useGetMeQuery } from '@/api/endpoints/authApi';
import {
  useConfirmImportMutation,
  usePreviewCsvImportMutation,
  useUploadImportMutation,
} from '@/api/endpoints/importsApi';
import { RequestImportPage } from '@/features/imports/RequestImportPage';
import {
  COMPANY_ID,
  createImportJob,
  createImportPreview,
  createMaterialRequest,
  createMembership,
  createTestUser,
  IMPORT_JOB_ID,
  REQUEST_ID,
} from '@/test/fixtures';
import { renderWithProviders } from '@/test/render';

vi.mock('@/api/endpoints/authApi', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/api/endpoints/authApi')>();
  return {
    ...actual,
    useGetMeQuery: vi.fn(),
  };
});

vi.mock('@/api/endpoints/importsApi', () => ({
  usePreviewCsvImportMutation: vi.fn(),
  useUploadImportMutation: vi.fn(),
  useGetImportJobQuery: vi.fn(() => ({
    data: undefined,
    isLoading: false,
    isFetching: false,
    error: undefined,
    refetch: vi.fn(),
  })),
  useConfirmImportMutation: vi.fn(),
}));

const mockedUseGetMeQuery = vi.mocked(useGetMeQuery);
const mockedUsePreviewCsvImportMutation = vi.mocked(usePreviewCsvImportMutation);
const mockedUseUploadImportMutation = vi.mocked(useUploadImportMutation);
const mockedUseConfirmImportMutation = vi.mocked(useConfirmImportMutation);

function mockMutationHook<T extends (...args: never[]) => unknown>(
  mock: ReturnType<typeof vi.fn>,
) {
  return [mock, { isLoading: false, reset: vi.fn() }] as unknown as ReturnType<T>;
}

function renderImportPage(route = '/app/requests/import') {
  return renderWithProviders(
    <Routes>
      <Route path="/app/requests/import" element={<RequestImportPage />} />
      <Route path="/app/requests/:requestId" element={<div>Request detail</div>} />
    </Routes>,
    {
      preloadedState: { auth: { activeCompanyId: COMPANY_ID } as never },
      route,
    },
  );
}

describe('RequestImportPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockedUseGetMeQuery.mockReturnValue({
      data: { user: createTestUser({
        memberships: [
          createMembership({
            effectivePermissions: ['viewRequests', 'manageRequests'],
          }),
        ],
      }) },
      isLoading: false,
      isFetching: false,
      refetch: vi.fn(),
    } as ReturnType<typeof useGetMeQuery>);

    mockedUsePreviewCsvImportMutation.mockReturnValue(
      mockMutationHook(vi.fn()) as ReturnType<typeof usePreviewCsvImportMutation>,
    );
    mockedUseUploadImportMutation.mockReturnValue(
      mockMutationHook(vi.fn()) as ReturnType<typeof useUploadImportMutation>,
    );
    mockedUseConfirmImportMutation.mockReturnValue(
      mockMutationHook(vi.fn()) as ReturnType<typeof useConfirmImportMutation>,
    );
  });

  it('renders import page for users with manageRequests', () => {
    renderImportPage();

    expect(screen.getByRole('heading', { name: /import request from csv/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /preview/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /^import$/i })).toBeDisabled();
  });

  it('shows preview table after successful preview', async () => {
    const previewMock = vi.fn().mockReturnValue({
      unwrap: () => Promise.resolve(createImportPreview()),
    });
    mockedUsePreviewCsvImportMutation.mockReturnValue(
      mockMutationHook(previewMock) as ReturnType<
        typeof usePreviewCsvImportMutation
      >,
    );

    const user = userEvent.setup();
    renderImportPage();

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(['description,quantity\nItem,1'], 'lines.csv', {
      type: 'text/csv',
    });
    await user.upload(fileInput, file);

    await user.click(screen.getByRole('button', { name: /preview/i }));

    await waitFor(() => {
      expect(previewMock).toHaveBeenCalled();
      expect(screen.getByText('Office paper')).toBeInTheDocument();
      expect(screen.getByText('Quantity is required')).toBeInTheDocument();
    });
  });

  it('redirects to request detail after import and confirm', async () => {
    const previewMock = vi.fn().mockReturnValue({
      unwrap: () => Promise.resolve(createImportPreview()),
    });
    const uploadMock = vi.fn().mockReturnValue({
      unwrap: () => Promise.resolve({ job: createImportJob() }),
    });
    const confirmMock = vi.fn().mockReturnValue({
      unwrap: () =>
        Promise.resolve({ request: createMaterialRequest({ id: REQUEST_ID }) }),
    });

    mockedUsePreviewCsvImportMutation.mockReturnValue(
      mockMutationHook(previewMock) as ReturnType<
        typeof usePreviewCsvImportMutation
      >,
    );
    mockedUseUploadImportMutation.mockReturnValue(
      mockMutationHook(uploadMock) as ReturnType<typeof useUploadImportMutation>,
    );
    mockedUseConfirmImportMutation.mockReturnValue(
      mockMutationHook(confirmMock) as ReturnType<
        typeof useConfirmImportMutation
      >,
    );

    const user = userEvent.setup();
    renderImportPage();

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    await user.upload(
      fileInput,
      new File(['description,quantity\nItem,1'], 'lines.csv', { type: 'text/csv' }),
    );
    await user.click(screen.getByRole('button', { name: /preview/i }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /^import$/i })).toBeEnabled();
    });

    await user.click(screen.getByRole('button', { name: /^import$/i }));

    await waitFor(() => {
      expect(uploadMock).toHaveBeenCalled();
      expect(confirmMock).toHaveBeenCalledWith({
        companyId: COMPANY_ID,
        jobId: IMPORT_JOB_ID,
      });
      expect(screen.getByText('Request detail')).toBeInTheDocument();
    });
  });

  it('keeps import disabled when preview has zero valid rows', async () => {
    const previewMock = vi.fn().mockReturnValue({
      unwrap: () =>
        Promise.resolve(createImportPreview({ validRowCount: 0, invalidRowCount: 2 })),
    });
    mockedUsePreviewCsvImportMutation.mockReturnValue(
      mockMutationHook(previewMock) as ReturnType<
        typeof usePreviewCsvImportMutation
      >,
    );

    const user = userEvent.setup();
    renderImportPage();

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    await user.upload(
      fileInput,
      new File(['description,quantity\n,'], 'lines.csv', { type: 'text/csv' }),
    );
    await user.click(screen.getByRole('button', { name: /preview/i }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /^import$/i })).toBeDisabled();
    });
  });
});
