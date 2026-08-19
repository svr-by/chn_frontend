import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';

import { DocumentStatusProgress } from '@/components/status/documentStatusProgress/DocumentStatusProgress';
import {
  MATERIAL_REQUEST_STATUS_FLOW,
  PAYMENT_STATUS_FLOW,
} from '@/lib/documentStatusFlows';
import { renderWithProviders } from '@/test/render';

describe('DocumentStatusProgress', () => {
  it('renders all lifecycle statuses', () => {
    renderWithProviders(
      <DocumentStatusProgress
        currentStatus="QUOTING"
        steps={MATERIAL_REQUEST_STATUS_FLOW.steps}
        enumKey={MATERIAL_REQUEST_STATUS_FLOW.enumKey}
      />,
    );

    expect(screen.getByText('Draft')).toBeInTheDocument();
    expect(screen.getByText('Quoting')).toBeInTheDocument();
    expect(screen.getByText('Partially ordered')).toBeInTheDocument();
    expect(screen.getByText('Ordered')).toBeInTheDocument();
    expect(screen.getByText('Closed')).toBeInTheDocument();
  });

  it('marks the current status as the active step', () => {
    renderWithProviders(
      <DocumentStatusProgress
        currentStatus="ORDERED"
        steps={MATERIAL_REQUEST_STATUS_FLOW.steps}
        enumKey={MATERIAL_REQUEST_STATUS_FLOW.enumKey}
      />,
    );

    expect(
      screen.getByText('Ordered').closest('.MuiChip-root'),
    ).toHaveAttribute('aria-current', 'step');
    expect(
      screen.getByText('Draft').closest('.MuiChip-root'),
    ).not.toHaveAttribute('aria-current');
  });

  it('shows branch terminal instead of happy-path end when rejected', () => {
    renderWithProviders(
      <DocumentStatusProgress
        currentStatus="REJECTED"
        steps={PAYMENT_STATUS_FLOW.steps}
        enumKey={PAYMENT_STATUS_FLOW.enumKey}
      />,
    );

    expect(screen.getByText('Pending')).toBeInTheDocument();
    expect(screen.getByText('Uploaded')).toBeInTheDocument();
    expect(screen.getByText('Rejected')).toBeInTheDocument();
    expect(screen.queryByText('Confirmed')).not.toBeInTheDocument();
  });

  it('hides rejected branch while on the happy path', () => {
    renderWithProviders(
      <DocumentStatusProgress
        currentStatus="UPLOADED"
        steps={PAYMENT_STATUS_FLOW.steps}
        enumKey={PAYMENT_STATUS_FLOW.enumKey}
      />,
    );

    expect(screen.getByText('Confirmed')).toBeInTheDocument();
    expect(screen.queryByText('Rejected')).not.toBeInTheDocument();
  });
});
