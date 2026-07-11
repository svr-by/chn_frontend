import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';

import { SelectionStatusBadge } from '@/components/SelectionStatusBadge';
import { renderWithProviders } from '@/test/render';

describe('SelectionStatusBadge', () => {
  it.each([
    ['DRAFT', 'Draft'],
    ['CONFIRMED', 'Confirmed'],
    ['CANCELLED', 'Cancelled'],
  ] as const)('renders %s as %s', (status, label) => {
    renderWithProviders(<SelectionStatusBadge status={status} />);
    expect(screen.getByText(label)).toBeInTheDocument();
  });
});
