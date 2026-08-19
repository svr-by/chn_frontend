import { Box, Chip, Stack } from '@mui/material';
import { useTranslation } from 'react-i18next';

import {
  getVisibleDocumentStatusSteps,
  type DocumentStatusEnumKey,
  type DocumentStatusStep,
} from '@/lib/documentStatusFlows';

export interface DocumentStatusProgressProps<T extends string = string> {
  currentStatus: T;
  steps: ReadonlyArray<DocumentStatusStep<T>>;
  /** i18n key under `enums`, e.g. `materialRequestStatus`. */
  enumKey: DocumentStatusEnumKey;
}

export function DocumentStatusProgress<T extends string>({
  currentStatus,
  steps,
  enumKey,
}: DocumentStatusProgressProps<T>) {
  const { t } = useTranslation(['enums', 'common']);
  const visibleSteps = getVisibleDocumentStatusSteps(steps, currentStatus);
  const activeIndex = visibleSteps.findIndex(
    (step) => step.value === currentStatus,
  );

  return (
    <Stack
      direction="row"
      alignItems="center"
      flexWrap="wrap"
      useFlexGap
      spacing={0.75}
      component="ol"
      aria-label={t('common:documentStatus.progress')}
      sx={{
        m: 0,
        p: 0,
        listStyle: 'none',
      }}
    >
      {visibleSteps.map((step, index) => {
        const isCurrent = step.value === currentStatus;
        const isCompleted = activeIndex >= 0 && index < activeIndex;
        const isUpcoming = activeIndex >= 0 && index > activeIndex;
        const label = t(`enums:${enumKey}.${step.value.toLowerCase()}`);

        return (
          <Box
            key={step.value}
            component="li"
            sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}
          >
            {index > 0 ? (
              <Box
                aria-hidden
                sx={{
                  width: 12,
                  height: 2,
                  borderRadius: 1,
                  bgcolor:
                    isCompleted || isCurrent
                      ? 'divider'
                      : 'action.disabledBackground',
                }}
              />
            ) : null}
            <Chip
              label={label}
              size="small"
              color={isCurrent ? step.color : 'default'}
              variant={isCurrent ? 'filled' : 'outlined'}
              aria-current={isCurrent ? 'step' : undefined}
              sx={{
                fontWeight: isCurrent ? 600 : 400,
                opacity: isUpcoming ? 0.55 : 1,
                ...(isCompleted
                  ? {
                      borderColor: 'transparent',
                      bgcolor: 'action.selected',
                    }
                  : null),
              }}
            />
          </Box>
        );
      })}
    </Stack>
  );
}
