import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';

import { PaymentStatusBadge } from '@/components/PaymentStatusBadge';
import { renderWithProviders } from '@/test/render';

describe('PaymentStatusBadge', () => {
  it.each([
    ['PENDING', 'Pending'],
    ['UPLOADED', 'Uploaded'],
    ['CONFIRMED', 'Confirmed'],
    ['REJECTED', 'Rejected'],
  ] as const)('renders %s as %s', (status, label) => {
    renderWithProviders(<PaymentStatusBadge status={status} />);
    expect(screen.getByText(label)).toBeInTheDocument();
  });
});
