import { describe, expect, it, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { usePreviewTranslateImportMutation } from '@/api/endpoints/importsApi';
import { RequestLinesTranslateDialog } from '@/features/requests/components/requestLinesTranslateDialog/RequestLinesTranslateDialog';
import { COMPANY_ID } from '@/test/fixtures';
import { renderWithProviders } from '@/test/render';

vi.mock('@/api/endpoints/importsApi', () => ({
  usePreviewTranslateImportMutation: vi.fn(),
}));

const mockedUsePreviewTranslateImportMutation = vi.mocked(
  usePreviewTranslateImportMutation,
);

describe('RequestLinesTranslateDialog', () => {
  const translatePreview = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    translatePreview.mockReturnValue({
      unwrap: () =>
        Promise.resolve({
          preview: {
            validRowCount: 1,
            invalidRowCount: 0,
            rows: [
              {
                rowNumber: 1,
                data: {},
                errors: [],
                parsed: {
                  description: 'Болт',
                  quantity: '10',
                  unit: 'шт',
                  sku: null,
                  productId: null,
                  notes: null,
                },
              },
            ],
          },
          columnMapping: {},
        }),
    });
    mockedUsePreviewTranslateImportMutation.mockReturnValue([
      translatePreview,
      { isLoading: false, reset: vi.fn(), error: undefined },
    ] as ReturnType<typeof usePreviewTranslateImportMutation>);
  });

  it('applies translated lines after process', async () => {
    const user = userEvent.setup();
    const onApply = vi.fn();
    const onClose = vi.fn();

    renderWithProviders(
      <RequestLinesTranslateDialog
        open
        onClose={onClose}
        companyId={COMPANY_ID}
        lines={[
          {
            clientId: 'c1',
            description: 'Bolt',
            quantity: '10',
            unit: 'pcs',
          },
        ]}
        onApply={onApply}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Process' }));

    await waitFor(() => {
      expect(translatePreview).toHaveBeenCalled();
      expect(onApply).toHaveBeenCalledWith([
        expect.objectContaining({
          clientId: 'c1',
          description: 'Болт',
          quantity: '10',
          unit: 'шт',
        }),
      ]);
      expect(onClose).toHaveBeenCalled();
    });
  });
});
