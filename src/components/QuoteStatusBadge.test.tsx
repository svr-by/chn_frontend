import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';

import { QuoteStatusBadge } from '@/components/QuoteStatusBadge';
import { renderWithProviders } from '@/test/render';

describe('QuoteStatusBadge', () => {
  it.each([
    ['DRAFT', 'Draft'],
    ['SUBMITTED', 'Submitted'],
    ['PARTIALLY_ACCEPTED', 'Partially accepted'],
    ['ACCEPTED', 'Accepted'],
    ['REJECTED', 'Rejected'],
    ['EXPIRED', 'Expired'],
  ] as const)('renders %s as %s', (status, label) => {
    renderWithProviders(<QuoteStatusBadge status={status} />);
    expect(screen.getByText(label)).toBeInTheDocument();
  });
});
