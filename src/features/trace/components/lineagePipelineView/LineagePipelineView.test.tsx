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
      screen.getByText(
        `Created: ${new Date('2026-01-01T00:00:00.000Z').toLocaleDateString()}`,
      ),
    ).toBeInTheDocument();
    expect(screen.getByText('Quoting')).toBeInTheDocument();
    expect(screen.getByText('Submitted')).toBeInTheDocument();
    expect(screen.getAllByText('Not reached yet').length).toBeGreaterThan(0);
  });
});
