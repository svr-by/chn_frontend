import type { Permission } from '@/types/api';

export type HelpArticleId =
  | 'overview'
  | 'team'
  | 'partners'
  | 'requests'
  | 'quotes'
  | 'invoices';

export interface HelpArticle {
  id: HelpArticleId;
  permission?: Permission;
  to?: string;
  step?: number;
  nextId?: HelpArticleId;
}

export const HELP_ARTICLES: HelpArticle[] = [
  { id: 'overview', nextId: 'team' },
  {
    id: 'team',
    permission: 'viewMembers',
    to: '/app/settings/team',
    step: 1,
    nextId: 'partners',
  },
  {
    id: 'partners',
    permission: 'viewPartners',
    to: '/app/partners',
    step: 2,
    nextId: 'requests',
  },
  {
    id: 'requests',
    permission: 'viewRequests',
    to: '/app/requests',
    step: 3,
    nextId: 'quotes',
  },
  {
    id: 'quotes',
    permission: 'viewQuotes',
    to: '/app/quotes',
    step: 4,
    nextId: 'invoices',
  },
  {
    id: 'invoices',
    permission: 'viewInvoices',
    to: '/app/invoices',
    step: 5,
  },
];
