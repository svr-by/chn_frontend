import { describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DownloadIcon from '@mui/icons-material/FileDownloadOutlined';
import { useMediaQuery } from '@mui/material';

import { ResponsiveIconButton } from '@/components/actions/responsiveIconButton/ResponsiveIconButton';
import { renderWithProviders } from '@/test/render';

vi.mock('@mui/material', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@mui/material')>();
  return {
    ...actual,
    useMediaQuery: vi.fn(),
  };
});

const mockedUseMediaQuery = vi.mocked(useMediaQuery);

describe('ResponsiveIconButton', () => {
  it('shows the label on wider screens', async () => {
    mockedUseMediaQuery.mockReturnValue(false);
    const user = userEvent.setup();
    const onClick = vi.fn();

    renderWithProviders(
      <ResponsiveIconButton
        label="Export CSV"
        icon={<DownloadIcon />}
        onClick={onClick}
      />,
    );

    const button = screen.getByRole('button', { name: 'Export CSV' });
    expect(button).toHaveTextContent('Export CSV');

    await user.click(button);
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('hides the label on compact screens', () => {
    mockedUseMediaQuery.mockReturnValue(true);

    renderWithProviders(
      <ResponsiveIconButton label="Export CSV" icon={<DownloadIcon />} />,
    );

    const button = screen.getByRole('button', { name: 'Export CSV' });
    expect(button).not.toHaveTextContent('Export CSV');
  });
});
