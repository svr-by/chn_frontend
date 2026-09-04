import { Stack, Typography } from '@mui/material';

import { RequestLineCancelledBadge } from '@/components/status/requestLineCancelledBadge/RequestLineCancelledBadge';
import { mrtEllipsisCellContentSx } from '@/lib/mrtNarrowColumns';
import {
  getRequestLineDisplaySku,
  type RequestLineSkuSource,
} from '@/lib/requestLineSku';

type RequestLineDescriptionSource = RequestLineSkuSource & {
  cancelledAt?: string | null;
};

export function RequestLineDescriptionCell({
  line,
}: {
  line: RequestLineDescriptionSource;
}) {
  const sku = getRequestLineDisplaySku(line);

  return (
    <Stack spacing={0.5} sx={{ minWidth: 0, overflow: 'hidden' }}>
      <Stack
        direction="row"
        spacing={1}
        alignItems="center"
        flexWrap="wrap"
        sx={{ minWidth: 0 }}
      >
        <Typography
          variant="body2"
          title={line.description}
          sx={{ ...mrtEllipsisCellContentSx, flex: '1 1 auto', minWidth: 0 }}
        >
          {line.description}
        </Typography>
        <RequestLineCancelledBadge cancelledAt={line.cancelledAt} />
      </Stack>
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
