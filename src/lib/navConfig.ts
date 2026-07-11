import type { SvgIconComponent } from '@mui/icons-material';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import AssignmentIcon from '@mui/icons-material/Assignment';
import CategoryIcon from '@mui/icons-material/Category';
import GroupsIcon from '@mui/icons-material/Groups';
import HandshakeIcon from '@mui/icons-material/Handshake';
import HubIcon from '@mui/icons-material/Hub';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import PaymentsIcon from '@mui/icons-material/Payments';
import PlaylistAddCheckIcon from '@mui/icons-material/PlaylistAddCheck';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
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
    labelKey: 'products',
    path: '/app/products',
    permission: 'viewProducts',
    phase: 3,
    icon: CategoryIcon,
  },
  {
    labelKey: 'quotes',
    path: '/app/quotes',
    permission: 'viewQuotes',
    phase: 5,
    icon: RequestQuoteIcon,
  },
  {
    labelKey: 'selections',
    path: '/app/selections',
    permission: 'viewSelections',
    phase: 6,
    icon: PlaylistAddCheckIcon,
  },
  {
    labelKey: 'invoices',
    path: '/app/invoices',
    permission: 'viewInvoices',
    phase: 7,
    icon: ReceiptLongIcon,
  },
  {
    labelKey: 'payments',
    path: '/app/payments',
    permission: 'viewPayments',
    phase: 7,
    icon: PaymentsIcon,
  },
  {
    labelKey: 'shipping',
    path: '/app/shipping-invoices',
    permission: 'viewShippingInvoices',
    phase: 8,
    icon: LocalShippingIcon,
  },
  {
    labelKey: 'consolidations',
    path: '/app/consolidations',
    permission: 'viewConsolidations',
    phase: 9,
    icon: HubIcon,
  },
  {
    labelKey: 'trace',
    path: '/app/trace',
    permission: 'viewTrace',
    phase: 11,
    icon: AccountTreeIcon,
  },
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
];

export const stubNavPaths = navConfig.map((item) => item.path);
