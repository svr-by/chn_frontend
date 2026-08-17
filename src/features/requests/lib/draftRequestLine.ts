import type { PostCompaniesCompanyIdImportsRequestLinesCsvPreview200PreviewRowsItem } from '@/api/generated/models/postCompaniesCompanyIdImportsRequestLinesCsvPreview200PreviewRowsItem';
import type { PostCompaniesCompanyIdImportsRequestLinesHtmPreview200PreviewRowsItem } from '@/api/generated/models/postCompaniesCompanyIdImportsRequestLinesHtmPreview200PreviewRowsItem';
import type { PostCompaniesCompanyIdImportsRequestLinesTranslatePreview200Preview } from '@/api/generated/models/postCompaniesCompanyIdImportsRequestLinesTranslatePreview200Preview';
import type { PostCompaniesCompanyIdImportsRequestLinesTranslatePreviewBodyPreview } from '@/api/generated/models/postCompaniesCompanyIdImportsRequestLinesTranslatePreviewBodyPreview';
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

export function mapPreviewRowsToDraftLines(
  rows: PreviewRow[],
): DraftRequestLine[] {
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

export function draftLinesToTranslatePreview(
  lines: DraftRequestLine[],
): PostCompaniesCompanyIdImportsRequestLinesTranslatePreviewBodyPreview {
  return {
    rows: lines.map((line, index) => ({
      rowNumber: index + 1,
      data: {
        description: line.description,
        quantity: line.quantity,
        ...(line.unit ? { unit: line.unit } : {}),
        ...(line.sku ? { sku: line.sku } : {}),
        ...(line.notes ? { notes: line.notes } : {}),
      },
      errors: [],
      parsed: {
        description: line.description,
        quantity: line.quantity,
        unit: line.unit ?? null,
        sku: line.sku ?? null,
        productId: line.productId ?? null,
        notes: line.notes ?? null,
      },
    })),
    validRowCount: lines.length,
    invalidRowCount: 0,
  };
}

export function applyTranslatedPreviewToDraftLines(
  lines: DraftRequestLine[],
  preview: PostCompaniesCompanyIdImportsRequestLinesTranslatePreview200Preview,
): DraftRequestLine[] {
  return lines.map((line, index) => {
    const row =
      preview.rows.find((item) => item.rowNumber === index + 1) ??
      preview.rows[index];
    const parsed = row?.parsed;
    if (!parsed) {
      return line;
    }

    return {
      ...line,
      description: parsed.description,
      unit: parsed.unit ?? undefined,
      notes: parsed.notes ?? undefined,
    };
  });
}
