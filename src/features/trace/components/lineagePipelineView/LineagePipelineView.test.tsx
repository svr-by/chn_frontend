import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';

import { LineagePipelineView } from '@/features/trace/components/lineagePipelineView/LineagePipelineView';
import { createLineageTrace } from '@/test/fixtures';
import { renderWithProviders } from '@/test/render';

describe('LineagePipelineView', () => {
  it('renders populated pipeline stages', () => {
    renderWithProviders(<LineagePipelineView trace={createLineageTrace()} />);

    expect(screen.getByText('Material request')).toBeInTheDocument();
    expect(screen.getByText('Supplier quotes')).toBeInTheDocument();
    expect(screen.getByText('Request: Office supplies')).toBeInTheDocument();
    expect(screen.getByText('Quotation: Supplier Ltd')).toBeInTheDocument();
    expect(screen.getAllByText('Line 1')).toHaveLength(2);
    expect(
      screen.getAllByText(
        `${new Date('2026-01-01T00:00:00.000Z').toLocaleDateString()}, Jane Doe`,
      ).length,
    ).toBeGreaterThan(0);
    expect(screen.getByText('Quoting')).toBeInTheDocument();
    expect(screen.getByText('Submitted')).toBeInTheDocument();
    expect(screen.queryByText('Purchase selections')).not.toBeInTheDocument();
    expect(screen.getAllByText('Not reached yet').length).toBeGreaterThan(0);
  });

  it('wraps the selected quote line instead of a separate selections stage', () => {
    const trace = createLineageTrace();
    const quote = trace.quotes[0];
    if (!quote) {
      throw new Error('expected a quote in the fixture');
    }
    quote.line.selectionLine = {
      id: '00000000-0000-0000-0000-000000000080',
      quantity: '8.0000',
      notes: 'Preferred supplier',
      buyerCompanyId: '00000000-0000-0000-0000-000000000010',
      createdAt: '2026-01-03T00:00:00.000Z',
      createdBy: { id: '00000000-0000-0000-0000-000000000001', name: 'Jane Doe' },
    };

    renderWithProviders(<LineagePipelineView trace={trace} />);

    expect(screen.queryByText('Purchase selections')).not.toBeInTheDocument();
    expect(screen.getByText('Selected')).toBeInTheDocument();
    expect(screen.getByText(/Selected qty/)).toBeInTheDocument();
    expect(screen.getByText('8.0000')).toBeInTheDocument();
    expect(
      screen.getByText(
        `${new Date('2026-01-03T00:00:00.000Z').toLocaleDateString()}, Jane Doe`,
      ),
    ).toBeInTheDocument();
    expect(screen.getByText('Quotation: Supplier Ltd')).toBeInTheDocument();
  });
});
