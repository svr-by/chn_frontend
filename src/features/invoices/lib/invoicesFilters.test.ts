import { describe, expect, it } from 'vitest';

import {
  buildInvoicesListQueryArgs,
  DEFAULT_INVOICES_FILTERS,
  clearCounterpartyOnDirectionChange,
  countActiveInvoicesFilters,
  getInvoiceStatusOptions,
} from '@/features/invoices/lib/invoicesFilters';
import {
  dateInputToIsoEndOfDay,
  dateInputToIsoStartOfDay,
} from '@/lib/dateInput';

describe('invoicesFilters', () => {
  it('maps counterparty to supplierCompanyId for inbound', () => {
    const args = buildInvoicesListQueryArgs({
      companyId: 'company-1',
      direction: 'inbound',
      limit: 20,
      offset: 0,
      filters: {
        ...DEFAULT_INVOICES_FILTERS,
        counterpartyCompanyId: 'partner-1',
      },
    });

    expect(args).toEqual(
      expect.objectContaining({
        supplierCompanyId: 'partner-1',
      }),
    );
    expect(args).not.toHaveProperty('buyerCompanyId');
  });

  it('maps counterparty to buyerCompanyId for outbound', () => {
    const args = buildInvoicesListQueryArgs({
      companyId: 'company-1',
      direction: 'outbound',
      limit: 20,
      offset: 0,
      filters: {
        ...DEFAULT_INVOICES_FILTERS,
        counterpartyCompanyId: 'partner-1',
      },
    });

    expect(args).toEqual(
      expect.objectContaining({
        buyerCompanyId: 'partner-1',
      }),
    );
    expect(args).not.toHaveProperty('supplierCompanyId');
  });

  it('converts created date range to ISO day bounds', () => {
    const args = buildInvoicesListQueryArgs({
      companyId: 'company-1',
      direction: 'inbound',
      limit: 20,
      offset: 0,
      filters: {
        ...DEFAULT_INVOICES_FILTERS,
        createdFrom: '2026-01-01',
        createdTo: '2026-01-31',
      },
    });

    expect(args.createdFrom).toBe(dateInputToIsoStartOfDay('2026-01-01'));
    expect(args.createdTo).toBe(dateInputToIsoEndOfDay('2026-01-31'));
  });

  it('clears counterparty on direction change', () => {
    const next = clearCounterpartyOnDirectionChange('outbound', {
      ...DEFAULT_INVOICES_FILTERS,
      counterpartyCompanyId: 'partner-1',
      status: 'ISSUED',
    });

    expect(next.counterpartyCompanyId).toBeNull();
    expect(next.status).toBe('ISSUED');
  });

  it('resets draft status when switching to inbound', () => {
    const next = clearCounterpartyOnDirectionChange('inbound', {
      ...DEFAULT_INVOICES_FILTERS,
      counterpartyCompanyId: 'partner-1',
      status: 'DRAFT',
    });

    expect(next.status).toBe('ALL');
    expect(next.counterpartyCompanyId).toBeNull();
  });

  it('excludes draft from inbound status options', () => {
    expect(getInvoiceStatusOptions('inbound')).not.toContain('DRAFT');
    expect(getInvoiceStatusOptions('outbound')).toContain('DRAFT');
  });

  it('counts active filters', () => {
    expect(countActiveInvoicesFilters(DEFAULT_INVOICES_FILTERS)).toBe(0);
    expect(
      countActiveInvoicesFilters({
        ...DEFAULT_INVOICES_FILTERS,
        status: 'ISSUED',
        currency: 'USD',
        number: ' INV-1 ',
        createdFrom: '2026-01-01',
      }),
    ).toBe(4);
  });

  it('maps number filter to API number param', () => {
    const args = buildInvoicesListQueryArgs({
      companyId: 'company-1',
      direction: 'inbound',
      limit: 20,
      offset: 0,
      filters: {
        ...DEFAULT_INVOICES_FILTERS,
        number: ' INV-100 ',
      },
    });

    expect(args).toEqual(
      expect.objectContaining({
        number: 'INV-100',
      }),
    );
    expect(args).not.toHaveProperty('invoiceNumber');
  });
});
