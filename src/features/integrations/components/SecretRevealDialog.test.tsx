import { describe, expect, it, vi } from 'vitest';
import { fireEvent, screen } from '@testing-library/react';

import { SecretRevealDialog } from '@/features/integrations/components/SecretRevealDialog';
import { renderWithProviders } from '@/test/render';

describe('SecretRevealDialog', () => {
  it('renders secret and calls onClose when dismissed', () => {
    const onClose = vi.fn();

    renderWithProviders(
      <SecretRevealDialog
        open
        title="API key created"
        secret="chn_live_secret_value"
        onClose={onClose}
      />,
    );

    expect(
      screen.getByDisplayValue('chn_live_secret_value'),
    ).toBeInTheDocument();
    expect(screen.getByText(/will not be shown again/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /I have saved it/i }));
    expect(onClose).toHaveBeenCalled();
  });

  it('copies secret to clipboard', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });

    renderWithProviders(
      <SecretRevealDialog
        open
        title="Webhook secret"
        secret="whsec_test"
        onClose={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: /Copy to clipboard/i }));
    expect(writeText).toHaveBeenCalledWith('whsec_test');
  });
});
