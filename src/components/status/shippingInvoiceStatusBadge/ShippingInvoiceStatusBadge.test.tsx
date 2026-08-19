import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';

import { ShippingInvoiceStatusBadge } from '@/components/status/shippingInvoiceStatusBadge/ShippingInvoiceStatusBadge';
import { renderWithProviders } from '@/test/render';

describe('ShippingInvoiceStatusBadge', () => {
  it.each([
    ['DRAFT', 'Draft'],
    ['ISSUED', 'Issued'],
    ['IN_TRANSIT', 'In transit'],
    ['DELIVERED', 'Delivered'],
  ] as const)('renders %s as %s', (status, label) => {
    renderWithProviders(<ShippingInvoiceStatusBadge status={status} />);
    expect(screen.getByText(label)).toBeInTheDocument();
  });
});
