import { describe, expect, it } from 'vitest';

import { CompanyApiKeyScopesItem } from '@/api/generated/models/companyApiKeyScopesItem';
import {
  applyScopePreset,
  FULL_ACCESS_SCOPE_PRESET,
  READ_ONLY_SCOPE_PRESET,
  SCOPE_GROUPS,
  toggleScope,
} from '@/lib/integrationScopes';

describe('integrationScopes', () => {
  it('groups all scopes without duplicates', () => {
    const grouped = SCOPE_GROUPS.flatMap((group) => group.scopes);
    const unique = new Set(grouped);
    expect(unique.size).toBe(grouped.length);
  });

  it('toggles a scope on and off', () => {
    const initial = [CompanyApiKeyScopesItem.viewRequests];
    const added = toggleScope(initial, CompanyApiKeyScopesItem.manageRequests);
    expect(added).toContain(CompanyApiKeyScopesItem.manageRequests);

    const removed = toggleScope(added, CompanyApiKeyScopesItem.viewRequests);
    expect(removed).not.toContain(CompanyApiKeyScopesItem.viewRequests);
  });

  it('applies read-only and full-access presets', () => {
    expect(applyScopePreset(READ_ONLY_SCOPE_PRESET)).toContain(
      CompanyApiKeyScopesItem.viewTrace,
    );
    expect(applyScopePreset(FULL_ACCESS_SCOPE_PRESET)).toContain(
      CompanyApiKeyScopesItem.manageInvoices,
    );
    expect(applyScopePreset(FULL_ACCESS_SCOPE_PRESET)).not.toContain(
      CompanyApiKeyScopesItem.manageIntegrations,
    );
  });
});
