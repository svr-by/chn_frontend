import type { SvgIconComponent } from '@mui/icons-material';
import AssignmentIcon from '@mui/icons-material/Assignment';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import GroupsIcon from '@mui/icons-material/Groups';
import HandshakeIcon from '@mui/icons-material/Handshake';
import RequestQuoteIcon from '@mui/icons-material/RequestQuote';

import type { Permission } from '@/types/api';

export interface NavItem {
  labelKey: string;
  path: string;
  permission: Permission;
  phase: number;
  icon: SvgIconComponent;
}

export const navConfig: NavItem[] = [
  {
    labelKey: 'requests',
    path: '/app/requests',
    permission: 'viewRequests',
    phase: 3,
    icon: AssignmentIcon,
  },
  {
    labelKey: 'requestLines',
    path: '/app/request-lines',
    permission: 'viewRequests',
    phase: 3,
    icon: FormatListBulletedIcon,
  },
  // {
  //   labelKey: 'products',
  //   path: '/app/products',
  //   permission: 'viewProducts',
  //   phase: 3,
  //   icon: CategoryIcon,
  // },
  {
    labelKey: 'quotes',
    path: '/app/quotes',
    permission: 'viewQuotes',
    phase: 5,
    icon: RequestQuoteIcon,
  },
  // {
  //   labelKey: 'selections',
  //   path: '/app/selections',
  //   permission: 'viewSelections',
  //   phase: 6,
  //   icon: PlaylistAddCheckIcon,
  // },
  // {
  //   labelKey: 'invoices',
  //   path: '/app/invoices',
  //   permission: 'viewInvoices',
  //   phase: 7,
  //   icon: ReceiptLongIcon,
  // },
  // {
  //   labelKey: 'payments',
  //   path: '/app/payments',
  //   permission: 'viewPayments',
  //   phase: 7,
  //   icon: PaymentsIcon,
  // },
  // {
  //   labelKey: 'shipping',
  //   path: '/app/shipping-invoices',
  //   permission: 'viewShippingInvoices',
  //   phase: 8,
  //   icon: LocalShippingIcon,
  // },
  // {
  //   labelKey: 'consolidations',
  //   path: '/app/consolidations',
  //   permission: 'viewConsolidations',
  //   phase: 9,
  //   icon: HubIcon,
  // },
  // {
  //   labelKey: 'trace',
  //   path: '/app/trace',
  //   permission: 'viewTrace',
  //   phase: 11,
  //   icon: AccountTreeIcon,
  // },
  {
    labelKey: 'partners',
    path: '/app/partners',
    permission: 'viewPartners',
    phase: 2,
    icon: HandshakeIcon,
  },
  {
    labelKey: 'team',
    path: '/app/settings/team',
    permission: 'viewMembers',
    phase: 1,
    icon: GroupsIcon,
  },
  // {
  //   labelKey: 'integrations',
  //   path: '/app/settings/integrations',
  //   permission: 'manageIntegrations',
  //   phase: 12,
  //   icon: IntegrationInstructionsIcon,
  // },
];

export const stubNavPaths = navConfig.map((item) => item.path);
