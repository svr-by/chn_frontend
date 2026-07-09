// --- Primitives ---
export type UUID = string;
export type ISODateTime = string;
export type DecimalString = string; // "10", "10.5", up to 4 decimal places
export type CurrencyCode = string; // "USD", "EUR"

export interface PaginationMeta {
  total: number;
  limit: number;
  offset: number;
}

export type Paginated<T, Key extends string = 'items'> = {
  pagination: PaginationMeta;
} & Record<Key, T[]>;

export type CursorPage<T, Key extends string = 'items'> = {
  nextCursor: string | null;
} & Record<Key, T[]>;

export interface CompanySummary {
  id: UUID;
  name: string;
}

export interface ApiError {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

// --- Enums (exact backend values) ---
export type MemberRole =
  | 'OWNER'
  | 'ADMIN'
  | 'PROCUREMENT'
  | 'LOGISTICS'
  | 'ACCOUNTANT'
  | 'WAREHOUSE'
  | 'VIEWER';

export type MemberStatus = 'ACTIVE' | 'SUSPENDED';

export type PartnerLinkStatus = 'INVITED' | 'ACTIVE' | 'REJECTED';

export type MaterialRequestStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'QUOTING'
  | 'PARTIALLY_ORDERED'
  | 'ORDERED'
  | 'CLOSED';

export type SupplierQuoteStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'PARTIALLY_ACCEPTED'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'EXPIRED';

export type PurchaseSelectionStatus = 'DRAFT' | 'CONFIRMED' | 'CANCELLED';

export type InvoiceStatus =
  | 'DRAFT'
  | 'ISSUED'
  | 'PARTIALLY_PAID'
  | 'PAID'
  | 'CONFIRMED';

export type PaymentStatus = 'PENDING' | 'UPLOADED' | 'CONFIRMED' | 'REJECTED';

export type ShippingInvoiceStatus =
  | 'DRAFT'
  | 'ISSUED'
  | 'IN_TRANSIT'
  | 'DELIVERED';

export type ConsolidationStatus =
  | 'DRAFT'
  | 'PLANNED'
  | 'IN_TRANSIT'
  | 'CUSTOMS'
  | 'DELIVERED';

export type TransportMode = 'ROAD' | 'AIR' | 'RAIL' | 'SEA';

export type DocumentType =
  | 'MATERIAL_REQUEST'
  | 'SUPPLIER_QUOTE'
  | 'PURCHASE_SELECTION'
  | 'INVOICE'
  | 'PAYMENT'
  | 'SHIPPING_INVOICE'
  | 'CONSOLIDATION';

export type NotificationType = 'DOCUMENT_STATUS_CHANGED' | 'COMMENT_ADDED';

export type ImportJobStatus =
  | 'PENDING'
  | 'PARSING'
  | 'PREVIEW_READY'
  | 'CONFIRMED'
  | 'COMPLETED'
  | 'FAILED';

export type Permission =
  | 'manageMembers'
  | 'manageMemberPermissions'
  | 'manageCompany'
  | 'viewMembers'
  | 'viewPartners'
  | 'managePartners'
  | 'viewProducts'
  | 'manageProducts'
  | 'viewRequests'
  | 'manageRequests'
  | 'viewQuotes'
  | 'manageQuotes'
  | 'viewSelections'
  | 'manageSelections'
  | 'viewInvoices'
  | 'manageInvoices'
  | 'viewPayments'
  | 'managePayments'
  | 'confirmPayments'
  | 'viewShippingInvoices'
  | 'manageShippingInvoices'
  | 'viewConsolidations'
  | 'manageConsolidations'
  | 'viewNotifications'
  | 'viewTrace'
  | 'manageIntegrations';

export interface MemberPermissionOverrides {
  grants?: Permission[];
  denies?: Permission[];
}

// --- Auth & identity ---

export interface User {
  id: UUID;
  email: string;
  firstName: string | null;
  lastName: string | null;
  emailVerified: boolean;
  createdAt: ISODateTime;
}

export interface AuthUser extends Omit<User, 'createdAt'> {}

import type { GetAuthMe200UserPendingInvitationsItem } from '@/api/generated/models/getAuthMe200UserPendingInvitationsItem';

export type { GetAuthMe200UserPendingInvitationsItem as PendingInvitation };

export interface MembershipSummary {
  id: UUID;
  role: MemberRole;
  status: MemberStatus;
  permissions: MemberPermissionOverrides | null;
  effectivePermissions: Permission[];
  invitedAt: ISODateTime | null;
  joinedAt: ISODateTime | null;
  company?: {
    id: UUID;
    name: string;
    taxId: string | null;
    country: string | null;
  };
}

export interface CurrentUser extends AuthUser {
  memberships: MembershipSummary[];
  pendingInvitations: GetAuthMe200UserPendingInvitationsItem[];
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

// --- Company & members ---

export interface Company {
  id: UUID;
  name: string;
  taxId: string | null;
  country: string | null;
  isActive: boolean;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
}

export interface CompanyMember {
  id: UUID;
  role: MemberRole;
  status: MemberStatus;
  permissions: MemberPermissionOverrides | null;
  effectivePermissions: Permission[];
  invitedAt: ISODateTime | null;
  joinedAt: ISODateTime | null;
  user?: AuthUser;
}

export interface PartnerCompany {
  id: UUID;
  name: string;
  taxId: string | null;
  country: string | null;
}

export interface PartnerLink {
  id: UUID;
  status: PartnerLinkStatus;
  direction: 'inbound' | 'outbound';
  company: PartnerCompany;
  invitedAt: ISODateTime;
  acceptedAt: ISODateTime | null;
  rejectedAt: ISODateTime | null;
}

// --- Product catalog ---

export interface Product {
  id: UUID;
  companyId: UUID;
  sku: string | null;
  name: string;
  description: string | null;
  unit: string | null;
  attributes: Record<string, unknown> | null;
  isActive: boolean;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
}

// --- Procurement — material request ---

export interface RequestLine {
  id: UUID;
  lineNumber: number;
  lineageId: UUID;
  description: string;
  quantity: DecimalString;
  unit: string | null;
  attributes: Record<string, unknown> | null;
  notes: string | null;
  product: { id: UUID; name: string; sku: string | null; unit: string | null } | null;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
}

export interface MaterialRequest {
  id: UUID;
  companyId: UUID;
  createdByUserId: UUID | null;
  title: string | null;
  reference: string | null;
  status: MaterialRequestStatus;
  notes: string | null;
  submittedAt: ISODateTime | null;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
  lines: RequestLine[];
}

export interface InboundMaterialRequest extends MaterialRequest {
  buyerCompany: CompanySummary;
  distributedAt: ISODateTime | null;
}

// --- Quotes ---

export interface QuoteLine {
  id: UUID;
  lineNumber: number;
  lineageId: UUID;
  requestLineId: UUID;
  quantity: DecimalString;
  unitPrice: DecimalString;
  lineTotal: DecimalString;
  notes: string | null;
  requestLine: {
    id: UUID;
    lineNumber: number;
    description: string;
    quantity: DecimalString;
    unit: string | null;
  };
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
}

export interface SupplierQuote {
  id: UUID;
  materialRequestId: UUID;
  buyerCompanyId: UUID;
  supplierCompanyId: UUID;
  createdByUserId: UUID | null;
  status: SupplierQuoteStatus;
  currency: CurrencyCode;
  validUntil: ISODateTime | null;
  notes: string | null;
  submittedAt: ISODateTime | null;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
  buyerCompany: CompanySummary | null;
  supplierCompany: CompanySummary | null;
  lines: QuoteLine[];
}

/** Buyer comparison view */
export interface QuoteComparisonLine {
  requestLine: {
    id: UUID;
    lineageId: UUID;
    lineNumber: number;
    description: string;
    quantity: DecimalString;
    unit: string | null;
  };
  offers: Array<{
    quoteId: UUID;
    supplierCompany: CompanySummary;
    quoteLineId: UUID;
    quantity: DecimalString;
    unitPrice: DecimalString;
    lineTotal: DecimalString;
    currency: CurrencyCode;
    status: SupplierQuoteStatus;
  }>;
}

// --- Selections ---

export interface SelectionLine {
  id: UUID;
  lineNumber: number;
  lineageId: UUID;
  quantity: DecimalString;
  notes: string | null;
  quoteLine: { id: UUID; quantity: DecimalString; unitPrice: DecimalString };
  quote: { id: UUID; currency: CurrencyCode; supplierCompany: CompanySummary };
  requestLine: {
    id: UUID;
    description: string;
    quantity: DecimalString;
    unit: string | null;
  } | null;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
}

export interface PurchaseSelection {
  id: UUID;
  materialRequestId: UUID;
  buyerCompanyId: UUID;
  createdByUserId: UUID | null;
  status: PurchaseSelectionStatus;
  notes: string | null;
  confirmedAt: ISODateTime | null;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
  materialRequest?: { id: UUID; title: string | null; status: MaterialRequestStatus };
  lines: SelectionLine[];
}

// --- Invoices & payments ---

export interface InvoiceLine {
  id: UUID;
  lineNumber: number;
  lineageId: UUID;
  quantity: DecimalString;
  unitPrice: DecimalString;
  lineTotal: DecimalString;
  notes: string | null;
  selectionLine: { id: UUID; quantity: DecimalString };
  requestLine: {
    id: UUID;
    description: string;
    quantity: DecimalString;
    unit: string | null;
  } | null;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
}

export interface Invoice {
  id: UUID;
  materialRequestId: UUID;
  purchaseSelectionId: UUID;
  buyerCompanyId: UUID;
  supplierCompanyId: UUID;
  createdByUserId: UUID | null;
  status: InvoiceStatus;
  currency: CurrencyCode;
  invoiceNumber: string | null;
  notes: string | null;
  issuedAt: ISODateTime | null;
  confirmedAt: ISODateTime | null;
  totalAmount: DecimalString;
  confirmedPaidAmount: DecimalString;
  remainingAmount: DecimalString;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
  buyerCompany: CompanySummary | null;
  supplierCompany: CompanySummary | null;
  lines: InvoiceLine[];
  payments?: Array<{ id: UUID; status: PaymentStatus; amount: DecimalString }>;
}

export interface Payment {
  id: UUID;
  invoiceId: UUID;
  buyerCompanyId: UUID;
  registeredByUserId: UUID | null;
  confirmedByUserId: UUID | null;
  status: PaymentStatus;
  amount: DecimalString;
  currency: CurrencyCode;
  fileName: string | null;
  rejectionReason: string | null;
  notes: string | null;
  uploadedAt: ISODateTime | null;
  confirmedAt: ISODateTime | null;
  rejectedAt: ISODateTime | null;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
  invoice?: {
    id: UUID;
    status: InvoiceStatus;
    currency: CurrencyCode;
    buyerCompanyId: UUID;
    supplierCompanyId: UUID;
  } | null;
}

// --- Shipping & consolidations ---

export interface ShippingLine {
  id: UUID;
  lineNumber: number;
  lineageId: UUID;
  quantity: DecimalString;
  notes: string | null;
  invoiceLine: {
    id: UUID;
    quantity: DecimalString;
    unitPrice: DecimalString;
    lineTotal: DecimalString;
  };
  requestLine: {
    id: UUID;
    description: string;
    quantity: DecimalString;
    unit: string | null;
  } | null;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
}

export interface ShippingInvoice {
  id: UUID;
  supplierInvoiceId: UUID;
  materialRequestId: UUID;
  buyerCompanyId: UUID;
  supplierCompanyId: UUID;
  managedByCompanyId: UUID;
  status: ShippingInvoiceStatus;
  trackingNumber: string | null;
  carrier: string | null;
  notes: string | null;
  issuedAt: ISODateTime | null;
  inTransitAt: ISODateTime | null;
  deliveredAt: ISODateTime | null;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
  buyerCompany: CompanySummary | null;
  supplierCompany: CompanySummary | null;
  lines: ShippingLine[];
}

export interface Consolidation {
  id: UUID;
  buyerCompanyId: UUID;
  createdByUserId: UUID | null;
  status: ConsolidationStatus;
  transportMode: TransportMode | null;
  carrier: string | null;
  trackingNumber: string | null;
  origin: string | null;
  destination: string | null;
  notes: string | null;
  plannedAt: ISODateTime | null;
  inTransitAt: ISODateTime | null;
  customsAt: ISODateTime | null;
  deliveredAt: ISODateTime | null;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
  buyerCompany: CompanySummary | null;
  shippingInvoices: Array<{
    id: UUID;
    lineNumber: number;
    notes: string | null;
    shippingInvoice: ShippingInvoice;
    createdAt: ISODateTime;
    updatedAt: ISODateTime;
  }>;
}

// --- Communication ---

export interface Comment {
  id: UUID;
  documentType: DocumentType;
  documentId: UUID;
  body: string;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
  author: {
    userId: UUID;
    companyId: UUID;
    companyName: string;
    name: string;
    email: string;
  };
}

export interface ActivityItem {
  id: UUID;
  source: 'event' | 'comment';
  createdAt: ISODateTime;
  actor: { userId: UUID; companyId: UUID; name: string } | null;
  eventType?: string;
  body?: string;
  payload?: unknown;
}

export interface Notification {
  id: UUID;
  type: NotificationType;
  documentType: DocumentType | null;
  documentId: UUID | null;
  commentId: UUID | null;
  documentEventId: UUID | null;
  title: string;
  body: string | null;
  readAt: ISODateTime | null;
  createdAt: ISODateTime;
}

// --- Trace ---

export interface LineageTrace {
  lineageId: UUID;
  request: MaterialRequest;
  requestLine: RequestLine;
  quotes: Array<{
    quoteId: UUID;
    supplierCompany: CompanySummary;
    status: SupplierQuoteStatus;
    currency: CurrencyCode;
    line: QuoteLine;
  }>;
  selections: Array<{
    selectionId: UUID;
    status: PurchaseSelectionStatus;
    line: SelectionLine;
  }>;
  invoices: Array<{
    invoiceId: UUID;
    supplierCompany: CompanySummary;
    status: InvoiceStatus;
    currency: CurrencyCode;
    invoiceNumber: string | null;
    line: InvoiceLine;
    payments: Array<{
      id: UUID;
      status: PaymentStatus;
      amount: DecimalString;
      currency: CurrencyCode;
    }>;
  }>;
  shipments: Array<{
    shippingInvoiceId: UUID;
    status: ShippingInvoiceStatus;
    trackingNumber: string | null;
    carrier: string | null;
    line: ShippingLine;
  }>;
  consolidations: Array<{
    consolidationId: UUID;
    status: ConsolidationStatus;
    transportMode: TransportMode | null;
    trackingNumber: string | null;
    linkedViaShippingInvoiceId: UUID;
  }>;
}

// --- Import job ---

export interface ImportJob {
  id: UUID;
  companyId: UUID;
  createdByUserId: UUID;
  type: 'REQUEST_LINES';
  status: ImportJobStatus;
  fileName: string;
  fieldDelimiter: string;
  decimalSeparator: string;
  requestTitle: string | null;
  preview: {
    rows: Array<{
      rowNumber: number;
      data: Record<string, string>;
      errors: string[];
      parsed?: {
        description: string;
        quantity: DecimalString;
        unit: string | null;
        sku: string | null;
        productId: UUID | null;
        notes: string | null;
      };
    }>;
    validRowCount: number;
    invalidRowCount: number;
  } | null;
  materialRequestId: UUID | null;
  errorMessage: string | null;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
}
