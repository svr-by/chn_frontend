import { Stack, Typography } from '@mui/material';

import { mrtEllipsisCellContentSx } from '@/lib/mrtNarrowColumns';
import {
  getRequestLineDisplaySku,
  type RequestLineSkuSource,
} from '@/lib/requestLineSku';

export type { RequestLineSkuSource } from '@/lib/requestLineSku';
export {
  getRequestLineDisplaySku,
  getRequestLineImportSku,
} from '@/lib/requestLineSku';

export function RequestLineDescriptionCell({
  line,
}: {
  line: RequestLineSkuSource;
}) {
  const sku = getRequestLineDisplaySku(line);

  return (
    <Stack spacing={0.5} sx={{ minWidth: 0, overflow: 'hidden' }}>
      <Typography
        variant="body2"
        title={line.description}
        sx={mrtEllipsisCellContentSx}
      >
        {line.description}
      </Typography>
      {sku ? (
        <Typography
          variant="caption"
          color="text.secondary"
          title={sku}
          sx={mrtEllipsisCellContentSx}
        >
          {sku}
        </Typography>
      ) : null}
    </Stack>
  );
}
