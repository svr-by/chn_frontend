import type { DocumentType } from '@/types/api';

export type DocumentDetailTab = 'comments' | 'activity';

const DOCUMENT_PATH_BUILDERS: Record<
  DocumentType,
  (documentId: string) => string
> = {
  MATERIAL_REQUEST: (id) => `/app/requests/${id}`,
  SUPPLIER_QUOTE: (id) => `/app/quotes/${id}`,
  PURCHASE_SELECTION: (id) => `/app/selections/${id}`,
  INVOICE: (id) => `/app/invoices/${id}`,
  PAYMENT: (id) => `/app/payments/${id}`,
  SHIPPING_INVOICE: (id) => `/app/shipping-invoices/${id}`,
  CONSOLIDATION: (id) => `/app/consolidations/${id}`,
};

export function resolveDocumentPath(
  documentType: DocumentType | null | undefined,
  documentId: string | null | undefined,
  options?: { tab?: DocumentDetailTab },
): string | null {
  if (!documentType || !documentId) {
    return null;
  }

  const buildPath = DOCUMENT_PATH_BUILDERS[documentType];
  if (!buildPath) {
    return null;
  }

  const path = buildPath(documentId);
  if (!options?.tab) {
    return path;
  }

  return `${path}?tab=${options.tab}`;
}

export function parseDocumentDetailTab(
  value: string | null,
): DocumentDetailTab | null {
  if (value === 'comments' || value === 'activity') {
    return value;
  }
  return null;
}
