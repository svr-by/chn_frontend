import {
  Box,
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
import { LineagePipelineSelectionShell } from '@/features/trace/components/lineagePipelineView/LineagePipelineSelectionShell';
import {
  buildLineagePipeline,
  groupPipelineItemsByDocument,
  type PipelineItem,
  type PipelineStage,
} from '@/lib/lineagePipeline';

interface LineagePipelineViewProps {
  trace: LineageTrace;
}

function renderPipelineItem(
  stage: PipelineStage,
  item: PipelineItem,
  index: number,
) {
  const key = `${stage}-${item.documentId}-${index}`;
  const card = <LineagePipelineItemCard stage={stage} item={item} />;
  const content = item.selection ? (
    <LineagePipelineSelectionShell selection={item.selection}>
      {card}
    </LineagePipelineSelectionShell>
  ) : (
    card
  );

  return (
    <Box
      key={key}
      sx={{
        width: '100%',
        maxWidth: 420,
        minWidth: 0,
        flex: { sm: '1 1 280px' },
      }}
    >
      {content}
    </Box>
  );
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
                {groupPipelineItemsByDocument(step.items).map((group) => (
                  <Stack
                    key={`${step.stage}-${group[0]?.documentId ?? 'group'}`}
                    direction={{ xs: 'column', sm: 'row' }}
                    spacing={1.5}
                    alignItems="stretch"
                    useFlexGap
                    sx={{ flexWrap: { sm: 'wrap' } }}
                  >
                    {group.map((item, index) =>
                      renderPipelineItem(step.stage, item, index),
                    )}
                  </Stack>
                ))}
              </Stack>
            )}
          </StepContent>
        </Step>
      ))}
    </Stepper>
  );
}
