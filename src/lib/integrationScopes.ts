import { CompanyApiKeyScopesItem } from '@/api/generated/models/companyApiKeyScopesItem';
import type { CompanyApiKeyScopesItem as Scope } from '@/api/generated/models/companyApiKeyScopesItem';

export interface ScopeGroup {
  labelKey: string;
  scopes: Scope[];
}

export const ALL_API_KEY_SCOPES = Object.values(
  CompanyApiKeyScopesItem,
) as Scope[];

export const SCOPE_GROUPS: ScopeGroup[] = [
  {
    labelKey: 'members',
    scopes: [
      CompanyApiKeyScopesItem.viewMembers,
      CompanyApiKeyScopesItem.manageMembers,
      CompanyApiKeyScopesItem.manageMemberPermissions,
      CompanyApiKeyScopesItem.manageCompany,
    ],
  },
  {
    labelKey: 'partners',
    scopes: [
      CompanyApiKeyScopesItem.viewPartners,
      CompanyApiKeyScopesItem.managePartners,
    ],
  },
  {
    labelKey: 'catalog',
    scopes: [
      CompanyApiKeyScopesItem.viewProducts,
      CompanyApiKeyScopesItem.manageProducts,
    ],
  },
  {
    labelKey: 'procurement',
    scopes: [
      CompanyApiKeyScopesItem.viewRequests,
      CompanyApiKeyScopesItem.manageRequests,
      CompanyApiKeyScopesItem.viewQuotes,
      CompanyApiKeyScopesItem.manageQuotes,
      CompanyApiKeyScopesItem.viewSelections,
      CompanyApiKeyScopesItem.manageSelections,
    ],
  },
  {
    labelKey: 'finance',
    scopes: [
      CompanyApiKeyScopesItem.viewInvoices,
      CompanyApiKeyScopesItem.manageInvoices,
      CompanyApiKeyScopesItem.viewPayments,
      CompanyApiKeyScopesItem.managePayments,
      CompanyApiKeyScopesItem.confirmPayments,
    ],
  },
  {
    labelKey: 'logistics',
    scopes: [
      CompanyApiKeyScopesItem.viewShippingInvoices,
      CompanyApiKeyScopesItem.manageShippingInvoices,
      CompanyApiKeyScopesItem.viewConsolidations,
      CompanyApiKeyScopesItem.manageConsolidations,
    ],
  },
  {
    labelKey: 'other',
    scopes: [
      CompanyApiKeyScopesItem.viewNotifications,
      CompanyApiKeyScopesItem.viewTrace,
      CompanyApiKeyScopesItem.manageIntegrations,
    ],
  },
];

export const READ_ONLY_SCOPE_PRESET: Scope[] = [
  CompanyApiKeyScopesItem.viewMembers,
  CompanyApiKeyScopesItem.viewPartners,
  CompanyApiKeyScopesItem.viewProducts,
  CompanyApiKeyScopesItem.viewRequests,
  CompanyApiKeyScopesItem.viewQuotes,
  CompanyApiKeyScopesItem.viewSelections,
  CompanyApiKeyScopesItem.viewInvoices,
  CompanyApiKeyScopesItem.viewPayments,
  CompanyApiKeyScopesItem.viewShippingInvoices,
  CompanyApiKeyScopesItem.viewConsolidations,
  CompanyApiKeyScopesItem.viewNotifications,
  CompanyApiKeyScopesItem.viewTrace,
];

export const FULL_ACCESS_SCOPE_PRESET: Scope[] = ALL_API_KEY_SCOPES.filter(
  (scope) => scope !== CompanyApiKeyScopesItem.manageIntegrations,
);

export function toggleScope(scopes: Scope[], scope: Scope): Scope[] {
  return scopes.includes(scope)
    ? scopes.filter((item) => item !== scope)
    : [...scopes, scope];
}

export function applyScopePreset(preset: Scope[]): Scope[] {
  return [...preset];
}
