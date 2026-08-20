import { Stack, Typography } from '@mui/material';

export type RequestLineSkuSource = {
  description: string;
  attributes?: { importSku?: unknown } | null;
  product?: { sku?: string | null } | null;
};

export function getRequestLineImportSku(line: RequestLineSkuSource) {
  const value = line.attributes?.importSku;
  return typeof value === 'string' && value.trim() ? value : null;
}

export function getRequestLineDisplaySku(line: RequestLineSkuSource) {
  return line.product?.sku ?? getRequestLineImportSku(line);
}

export function RequestLineDescriptionCell({
  line,
}: {
  line: RequestLineSkuSource;
}) {
  const sku = getRequestLineDisplaySku(line);

  return (
    <Stack spacing={0.5}>
      <Typography variant="body2">{line.description}</Typography>
      {sku ? (
        <Typography variant="caption" color="text.secondary">
          {sku}
        </Typography>
      ) : null}
    </Stack>
  );
}
