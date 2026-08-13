import {
  Stack,
  Step,
  StepContent,
  StepLabel,
  Stepper,
  Typography,
} from '@mui/material';
import { useTranslation } from 'react-i18next';

import type { LineageTrace } from '@/api/generated/models/lineageTrace';
import { LineagePipelineItemCard } from '@/features/trace/components/lineagePipelineView/LineagePipelineItemCard';
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
                {step.items.map((item, index) => (
                  <LineagePipelineItemCard
                    key={`${step.stage}-${item.documentId}-${index}`}
                    stage={step.stage}
                    item={item}
                  />
                ))}
              </Stack>
            )}
          </StepContent>
        </Step>
      ))}
    </Stepper>
  );
}
