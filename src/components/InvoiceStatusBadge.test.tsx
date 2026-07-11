import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';

import { InvoiceStatusBadge } from '@/components/InvoiceStatusBadge';
import { renderWithProviders } from '@/test/render';

describe('InvoiceStatusBadge', () => {
  it.each([
    ['DRAFT', 'Draft'],
    ['ISSUED', 'Issued'],
    ['PARTIALLY_PAID', 'Partially paid'],
    ['PAID', 'Paid'],
    ['CONFIRMED', 'Confirmed'],
  ] as const)('renders %s as %s', (status, label) => {
    renderWithProviders(<InvoiceStatusBadge status={status} />);
    expect(screen.getByText(label)).toBeInTheDocument();
  });
});
