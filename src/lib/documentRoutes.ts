import { DocumentTypeValues, type DocumentType } from '@/types/api';

export type DocumentDetailTab = 'comments' | 'activity' | 'trace' | 'related';

/** Must cover every backend document type — fails tsc if OpenAPI adds a value. */
const DOCUMENT_PATH_BUILDERS = {
  [DocumentTypeValues.MATERIAL_REQUEST]: (id: string) => `/app/requests/${id}`,
  [DocumentTypeValues.SUPPLIER_QUOTE]: (id: string) => `/app/quotes/${id}`,
  [DocumentTypeValues.PURCHASE_SELECTION]: (id: string) =>
    `/app/selections/${id}`,
  [DocumentTypeValues.INVOICE]: (id: string) => `/app/invoices/${id}`,
  [DocumentTypeValues.PAYMENT]: (id: string) => `/app/payments/${id}`,
  [DocumentTypeValues.SHIPPING_INVOICE]: (id: string) =>
    `/app/shipping-invoices/${id}`,
  [DocumentTypeValues.CONSOLIDATION]: (id: string) =>
    `/app/consolidations/${id}`,
} as const satisfies Record<DocumentType, (documentId: string) => string>;

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
  if (
    value === 'comments' ||
    value === 'activity' ||
    value === 'trace' ||
    value === 'related'
  ) {
    return value;
  }
  return null;
}
