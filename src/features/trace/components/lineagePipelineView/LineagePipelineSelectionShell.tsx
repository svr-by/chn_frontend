import type { ReactNode } from 'react';
import { Box, Chip, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';

import { DecimalDisplay } from '@/components/dataDisplay/decimalDisplay/DecimalDisplay';
import { LineageCreatedMeta } from '@/features/trace/components/lineagePipelineView/LineageCreatedMeta';
import type { PipelineSelection } from '@/lib/lineagePipeline';

interface LineagePipelineSelectionShellProps {
  selection: PipelineSelection;
  children: ReactNode;
}

export function LineagePipelineSelectionShell({
  selection,
  children,
}: LineagePipelineSelectionShellProps) {
  const { t } = useTranslation('trace');

  return (
    <Box
      sx={{
        maxWidth: 420,
        p: 1.5,
        border: 1,
        borderColor: 'success.main',
        borderRadius: 2,
        bgcolor: (theme) => alpha(theme.palette.success.main, 0.08),
      }}
    >
      <Stack spacing={0.75} sx={{ mb: 1.5 }}>
        {children}
        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
          flexWrap="wrap"
          useFlexGap
        >
          <Chip
            size="small"
            color="success"
            variant="outlined"
            label={t('pipelineStatus.selected')}
          />
        </Stack>
        <LineageCreatedMeta
          createdAt={selection.createdAt}
          createdBy={selection.createdBy}
        />
      </Stack>
    </Box>
  );
}
