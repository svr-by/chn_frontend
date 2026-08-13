import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Chip,
  Link,
  Stack,
  Typography,
} from '@mui/material';
import { useTranslation } from 'react-i18next';

import { DecimalDisplay } from '@/components/DecimalDisplay';
import { RequestLineCancelledBadge } from '@/components/RequestLineCancelledBadge';
import type { PipelineItem, PipelineStage } from '@/lib/lineagePipeline';
import { getPipelineItemStatusLabel } from '@/lib/traceLabels';

export interface LineagePipelineItemCardProps {
  stage: PipelineStage;
  item: PipelineItem;
}

export function LineagePipelineItemCard({
  stage,
  item,
}: LineagePipelineItemCardProps) {
  const { t } = useTranslation(['trace', 'enums', 'common']);
  const statusLabel = getPipelineItemStatusLabel(stage, item.status, t);
  const title = t(`pipeline.itemLabel.${stage}`, { label: item.label });
  const lineNumber = item.meta?.lineNumber;
  const companyName = item.meta?.companyName;
  const createdAt = item.meta?.createdAt;

  const transportModeKey = item.meta?.transportMode?.toLowerCase();
  const transportModeLabel = transportModeKey
    ? t(`enums:transportMode.${transportModeKey}`, {
        defaultValue: item.meta?.transportMode,
      })
    : null;

  return (
    <Card variant="outlined" sx={{ maxWidth: 420 }}>
      <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
        <Stack spacing={1}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            flexWrap="wrap"
            gap={1}
          >
            <Link
              component={RouterLink}
              to={item.link}
              underline="hover"
              fontWeight={600}
            >
              {title}
            </Link>
            <Chip label={statusLabel} size="small" variant="outlined" />
          </Stack>

          {companyName ? (
            <Typography variant="body2" color="text.secondary">
              {companyName}
            </Typography>
          ) : null}

          {lineNumber ? (
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              flexWrap="wrap"
            >
              <Typography variant="body2" color="text.secondary">
                {t('common:requestLine.lineNumber', { number: lineNumber })}
              </Typography>
              {stage === 'request' ? (
                <RequestLineCancelledBadge
                  cancelledAt={item.meta?.cancelledAt}
                />
              ) : null}
            </Stack>
          ) : null}

          {stage === 'request' && item.meta ? (
            <Box>
              <Typography variant="body2">
                <DecimalDisplay value={item.meta.quantity} component="span" />
                {item.meta.unit ? ` ${item.meta.unit}` : ''}
              </Typography>
            </Box>
          ) : null}

          {stage === 'quotes' && item.meta ? (
            <Typography variant="body2" color="text.secondary">
              {t('pipeline.quoteMeta', {
                unitPrice: item.meta.unitPrice,
                quantity: item.meta.quantity,
                currency: item.meta.currency,
              })}
            </Typography>
          ) : null}

          {stage === 'invoices' && item.meta ? (
            <Typography variant="body2" color="text.secondary">
              {t('pipeline.invoiceMeta', {
                payments: item.meta.payments,
              })}
            </Typography>
          ) : null}

          {stage === 'shipments' && item.meta?.trackingNumber ? (
            <Typography variant="body2" color="text.secondary">
              {t('pipeline.shipmentMeta', {
                carrier: item.meta.carrier || '—',
                trackingNumber: item.meta.trackingNumber,
              })}
            </Typography>
          ) : null}

          {stage === 'consolidations' && item.meta ? (
            <Stack spacing={0.5}>
              {transportModeLabel ? (
                <Typography variant="body2" color="text.secondary">
                  {t('pipeline.consolidationTransport', {
                    mode: transportModeLabel,
                  })}
                </Typography>
              ) : null}
              {item.meta.linkedViaShippingInvoiceId ? (
                <Typography variant="body2" color="text.secondary">
                  {t('pipeline.consolidationViaShipping')}:{' '}
                  <Link
                    component={RouterLink}
                    to={`/app/shipping-invoices/${item.meta.linkedViaShippingInvoiceId}`}
                    underline="hover"
                  >
                    {item.meta.linkedViaShippingInvoiceId.slice(0, 8)}
                  </Link>
                </Typography>
              ) : null}
            </Stack>
          ) : null}

          {createdAt ? (
            <Typography variant="body2" color="text.secondary">
              {t('common:createdAt', {
                date: new Date(createdAt).toLocaleDateString(),
              })}
            </Typography>
          ) : null}
        </Stack>
      </CardContent>
    </Card>
  );
}
