import type { Permission } from '@/types/api';

export interface NavItem {
  labelKey: string;
  path: string;
  permission: Permission;
  phase: number;
}

export const navConfig: NavItem[] = [
  { labelKey: 'requests', path: '/app/requests', permission: 'viewRequests', phase: 3 },
  { labelKey: 'products', path: '/app/products', permission: 'viewProducts', phase: 3 },
  { labelKey: 'quotes', path: '/app/quotes', permission: 'viewQuotes', phase: 5 },
  {
    labelKey: 'selections',
    path: '/app/selections',
    permission: 'viewSelections',
    phase: 6,
  },
  { labelKey: 'invoices', path: '/app/invoices', permission: 'viewInvoices', phase: 7 },
  { labelKey: 'payments', path: '/app/payments', permission: 'viewPayments', phase: 7 },
  {
    labelKey: 'shipping',
    path: '/app/shipping-invoices',
    permission: 'viewShippingInvoices',
    phase: 8,
  },
  {
    labelKey: 'consolidations',
    path: '/app/consolidations',
    permission: 'viewConsolidations',
    phase: 9,
  },
  { labelKey: 'trace', path: '/app/trace', permission: 'viewTrace', phase: 11 },
  { labelKey: 'partners', path: '/app/partners', permission: 'viewPartners', phase: 2 },
  { labelKey: 'team', path: '/app/settings/team', permission: 'viewMembers', phase: 1 },
];

export const stubNavPaths = navConfig.map((item) => item.path);
