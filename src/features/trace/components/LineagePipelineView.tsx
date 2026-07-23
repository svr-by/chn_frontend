import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Chip,
  Link,
  Stack,
  Step,
  StepContent,
  StepLabel,
  Stepper,
  Typography,
} from '@mui/material';
import { useTranslation } from 'react-i18next';

import type { LineageTrace } from '@/api/generated/models/lineageTrace';
import { DecimalDisplay } from '@/components/DecimalDisplay';
import { buildLineagePipeline } from '@/lib/lineagePipeline';

interface LineagePipelineViewProps {
  trace: LineageTrace;
}

export function LineagePipelineView({ trace }: LineagePipelineViewProps) {
  const { t } = useTranslation('trace');
  const steps = buildLineagePipeline(trace);
  const activeStep = steps.reduce(
    (lastIndex, step, index) => (step.items.length > 0 ? index : lastIndex),
    0,
  );

  return (
    <Stepper activeStep={activeStep} orientation="vertical" nonLinear>
      {steps.map((step) => (
        <Step key={step.stage} expanded>
          <StepLabel>
            <Typography variant="subtitle1">
              {t(`pipeline.stages.${step.stage}`)}
            </Typography>
          </StepLabel>
          <StepContent>
            {step.items.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                {t('pipeline.emptyStage')}
              </Typography>
            ) : (
              <Stack spacing={1.5} sx={{ pb: 2 }}>
                {step.items.map((item) => (
                  <Card
                    key={`${step.stage}-${item.documentId}`}
                    variant="outlined"
                  >
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
                            {item.label}
                          </Link>
                          <Chip
                            label={item.status}
                            size="small"
                            variant="outlined"
                          />
                        </Stack>

                        {step.stage === 'request' && item.meta ? (
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              {item.meta.description}
                            </Typography>
                            <Typography variant="body2">
                              <DecimalDisplay
                                value={item.meta.quantity}
                                component="span"
                              />
                              {item.meta.unit ? ` ${item.meta.unit}` : ''}
                            </Typography>
                          </Box>
                        ) : null}

                        {step.stage === 'quotes' && item.meta ? (
                          <Typography variant="body2" color="text.secondary">
                            {t('pipeline.quoteMeta', {
                              unitPrice: item.meta.unitPrice,
                              quantity: item.meta.quantity,
                              currency: item.meta.currency,
                            })}
                          </Typography>
                        ) : null}

                        {step.stage === 'invoices' && item.meta ? (
                          <Typography variant="body2" color="text.secondary">
                            {t('pipeline.invoiceMeta', {
                              supplier: item.meta.supplier,
                              payments: item.meta.payments,
                            })}
                          </Typography>
                        ) : null}

                        {step.stage === 'shipments' &&
                        item.meta?.trackingNumber ? (
                          <Typography variant="body2" color="text.secondary">
                            {t('pipeline.shipmentMeta', {
                              carrier: item.meta.carrier || '—',
                              trackingNumber: item.meta.trackingNumber,
                            })}
                          </Typography>
                        ) : null}

                        {step.stage === 'consolidations' && item.meta ? (
                          <Stack spacing={0.5}>
                            {item.meta.transportMode ? (
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                {t('pipeline.consolidationTransport', {
                                  mode: item.meta.transportMode,
                                })}
                              </Typography>
                            ) : null}
                            {item.meta.linkedViaShippingInvoiceId ? (
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                {t('pipeline.consolidationViaShipping')}:{' '}
                                <Link
                                  component={RouterLink}
                                  to={`/app/shipping-invoices/${item.meta.linkedViaShippingInvoiceId}`}
                                  underline="hover"
                                >
                                  {item.meta.linkedViaShippingInvoiceId.slice(
                                    0,
                                    8,
                                  )}
                                </Link>
                              </Typography>
                            ) : null}
                          </Stack>
                        ) : null}
                      </Stack>
                    </CardContent>
                  </Card>
                ))}
              </Stack>
            )}
          </StepContent>
        </Step>
      ))}
    </Stepper>
  );
}
