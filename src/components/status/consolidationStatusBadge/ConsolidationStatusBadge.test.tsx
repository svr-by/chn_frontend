import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';

import { ConsolidationStatusBadge } from '@/components/status/consolidationStatusBadge/ConsolidationStatusBadge';
import { renderWithProviders } from '@/test/render';

describe('ConsolidationStatusBadge', () => {
  it.each([
    ['DRAFT', 'Draft'],
    ['PLANNED', 'Planned'],
    ['IN_TRANSIT', 'In transit'],
    ['CUSTOMS', 'Customs'],
    ['DELIVERED', 'Delivered'],
  ] as const)('renders %s as %s', (status, label) => {
    renderWithProviders(<ConsolidationStatusBadge status={status} />);
    expect(screen.getByText(label)).toBeInTheDocument();
  });
});
