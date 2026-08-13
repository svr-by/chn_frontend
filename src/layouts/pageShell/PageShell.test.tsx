import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';

import { PageShell } from './PageShell';
import { renderWithProviders } from '@/test/render';

describe('PageShell', () => {
  it('centers constrained content for md width', () => {
    renderWithProviders(
      <PageShell maxWidth="md">
        <div>Form content</div>
      </PageShell>,
    );

    const shell = screen.getByTestId('page-shell');
    expect(shell).toHaveAttribute('data-max-width', 'md');
    expect(shell).toHaveStyle({ maxWidth: '960px' });
    expect(screen.getByText('Form content')).toBeInTheDocument();
  });

  it('does not set maxWidth for fluid', () => {
    renderWithProviders(
      <PageShell maxWidth="fluid">
        <div>Wide content</div>
      </PageShell>,
    );

    const shell = screen.getByTestId('page-shell');
    expect(shell).toHaveAttribute('data-max-width', 'fluid');
    expect(shell).not.toHaveStyle({ maxWidth: '1440px' });
  });

  it('fills viewport height when fillViewport is set', () => {
    renderWithProviders(
      <PageShell fillViewport>
        <div>List content</div>
      </PageShell>,
    );

    const shell = screen.getByTestId('page-shell');
    expect(shell).toHaveStyle({ display: 'flex' });
  });
});
