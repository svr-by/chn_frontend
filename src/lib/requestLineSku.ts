export type RequestLineSkuSource = {
  description: string;
  sku?: string | null;
  attributes?: { importSku?: unknown } | null;
  product?: { sku?: string | null } | null;
};

export function getRequestLineImportSku(line: RequestLineSkuSource) {
  const value = line.attributes?.importSku;
  return typeof value === 'string' && value.trim() ? value : null;
}

function getRequestLineTopLevelSku(line: RequestLineSkuSource) {
  const value = line.sku;
  return typeof value === 'string' && value.trim() ? value : null;
}

export function getRequestLineDisplaySku(line: RequestLineSkuSource) {
  return (
    line.product?.sku ??
    getRequestLineImportSku(line) ??
    getRequestLineTopLevelSku(line)
  );
}
