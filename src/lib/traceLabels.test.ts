import { describe, expect, it } from 'vitest';

import i18n from '@/app/i18n';
import { createLineageEvent } from '@/test/fixtures';
import {
  getDocumentStatusLabel,
  getLineageEventLabel,
  getPipelineStatusLabel,
  getRelationLabel,
} from '@/lib/traceLabels';

describe('traceLabels', () => {
  const t = i18n.getFixedT('en', ['trace', 'enums', 'collaboration']);

  it('translates pipeline status values', () => {
    expect(getPipelineStatusLabel('quoted', t)).toBe('Quoted');
    expect(getPipelineStatusLabel(null, t)).toBe('Unknown');
  });

  it('translates document status by document type', () => {
    expect(getDocumentStatusLabel('MATERIAL_REQUEST', 'QUOTING', t)).toBe(
      'Quoting',
    );
    expect(getDocumentStatusLabel('INVOICE', 'ISSUED', t)).toBe('Issued');
    expect(getDocumentStatusLabel('PAYMENT', 'UNKNOWN_STATUS', t)).toBe(
      'UNKNOWN_STATUS',
    );
  });

  it('falls back to raw relation when key is missing', () => {
    expect(getRelationLabel('custom_relation', t)).toBe('custom_relation');
  });

  it('reuses activity event labels for lineage events', () => {
    const event = createLineageEvent({ eventType: 'INVOICE_ISSUED' });
    expect(getLineageEventLabel(event, t)).toBe('Invoice issued');
  });
});
