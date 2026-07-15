import type { PostCompaniesCompanyIdImportsRequestLinesCsvPreview200PreviewRowsItem } from '@/api/generated/models/postCompaniesCompanyIdImportsRequestLinesCsvPreview200PreviewRowsItem';
import type { PostCompaniesCompanyIdImportsRequestLinesHtmPreview200PreviewRowsItem } from '@/api/generated/models/postCompaniesCompanyIdImportsRequestLinesHtmPreview200PreviewRowsItem';
import type { PostCompaniesCompanyIdRequestsBodyLinesItem } from '@/api/generated/models/postCompaniesCompanyIdRequestsBodyLinesItem';

export type DraftRequestLine = {
  clientId: string;
  description: string;
  quantity: string;
  unit?: string;
  sku?: string;
  productId?: string;
  notes?: string;
};

export type RequestLineFormValues = {
  productId?: string | null;
  description: string;
  quantity: string;
  unit?: string;
  notes?: string;
};

type PreviewRow =
  | PostCompaniesCompanyIdImportsRequestLinesCsvPreview200PreviewRowsItem
  | PostCompaniesCompanyIdImportsRequestLinesHtmPreview200PreviewRowsItem;

function createClientId(): string {
  return crypto.randomUUID();
}

export function createEmptyDraftLine(
  values: RequestLineFormValues,
): DraftRequestLine {
  return {
    clientId: createClientId(),
    description: values.description,
    quantity: values.quantity,
    unit: values.unit || undefined,
    productId: values.productId || undefined,
    notes: values.notes || undefined,
  };
}

export function updateDraftLine(
  line: DraftRequestLine,
  values: RequestLineFormValues,
): DraftRequestLine {
  return {
    ...line,
    description: values.description,
    quantity: values.quantity,
    unit: values.unit || undefined,
    productId: values.productId || undefined,
    notes: values.notes || undefined,
  };
}

export function draftLinesToCreatePayload(
  lines: DraftRequestLine[],
): PostCompaniesCompanyIdRequestsBodyLinesItem[] {
  return lines.map((line) => ({
    description: line.description,
    quantity: line.quantity,
    ...(line.unit ? { unit: line.unit } : {}),
    ...(line.sku ? { sku: line.sku } : {}),
    ...(line.productId ? { productId: line.productId } : {}),
    ...(line.notes ? { notes: line.notes } : {}),
  }));
}

export function mapPreviewRowsToDraftLines(rows: PreviewRow[]): DraftRequestLine[] {
  return rows
    .filter((row) => row.parsed && row.errors.length === 0)
    .map((row) => {
      const parsed = row.parsed!;
      return {
        clientId: createClientId(),
        description: parsed.description,
        quantity: parsed.quantity,
        unit: parsed.unit ?? undefined,
        sku: parsed.sku ?? undefined,
        productId: parsed.productId ?? undefined,
        notes: parsed.notes ?? undefined,
      };
    });
}

export function isCsvImportFile(file: File): boolean {
  const name = file.name.toLowerCase();
  return name.endsWith('.csv') || file.type === 'text/csv';
}
