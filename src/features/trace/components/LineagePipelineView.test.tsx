import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';

import { LineagePipelineView } from '@/features/trace/components/LineagePipelineView';
import { createLineageTrace } from '@/test/fixtures';
import { renderWithProviders } from '@/test/render';

describe('LineagePipelineView', () => {
  it('renders populated pipeline stages', () => {
    renderWithProviders(<LineagePipelineView trace={createLineageTrace()} />);

    expect(screen.getByText('Material request')).toBeInTheDocument();
    expect(screen.getByText('Supplier quotes')).toBeInTheDocument();
    expect(
      screen.getByText('Request: Office supplies · line 1'),
    ).toBeInTheDocument();
    expect(screen.getByText('Supplier: Supplier Ltd')).toBeInTheDocument();
    expect(screen.getAllByText('Not reached yet').length).toBeGreaterThan(0);
  });
});
