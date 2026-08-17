import SendIcon from '@mui/icons-material/SendOutlined';
import RequestQuoteIcon from '@mui/icons-material/RequestQuoteOutlined';
import PlaylistAddCheckIcon from '@mui/icons-material/PlaylistAddCheckOutlined';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLongOutlined';
import LocalShippingIcon from '@mui/icons-material/LocalShippingOutlined';
import HubIcon from '@mui/icons-material/HubOutlined';
import { Box, Stack, Tooltip } from '@mui/material';
import type { SvgIconComponent } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

import type { RequestLineLinks } from '@/api/generated/models/requestLineLinks';

interface PipelineStageConfig {
  key: keyof Pick<
    RequestLineLinks,
    | 'distributed'
    | 'hasQuote'
    | 'hasSelection'
    | 'hasInvoice'
    | 'hasShipping'
    | 'hasConsolidation'
  >;
  icon: SvgIconComponent;
  labelKey:
    | 'requestLines.pipeline.distributed'
    | 'requestLines.pipeline.quote'
    | 'requestLines.pipeline.selection'
    | 'requestLines.pipeline.invoice'
    | 'requestLines.pipeline.shipping'
    | 'requestLines.pipeline.consolidation';
}

const PIPELINE_STAGES: PipelineStageConfig[] = [
  {
    key: 'distributed',
    icon: SendIcon,
    labelKey: 'requestLines.pipeline.distributed',
  },
  {
    key: 'hasQuote',
    icon: RequestQuoteIcon,
    labelKey: 'requestLines.pipeline.quote',
  },
  {
    key: 'hasSelection',
    icon: PlaylistAddCheckIcon,
    labelKey: 'requestLines.pipeline.selection',
  },
  {
    key: 'hasInvoice',
    icon: ReceiptLongIcon,
    labelKey: 'requestLines.pipeline.invoice',
  },
  {
    key: 'hasShipping',
    icon: LocalShippingIcon,
    labelKey: 'requestLines.pipeline.shipping',
  },
  {
    key: 'hasConsolidation',
    icon: HubIcon,
    labelKey: 'requestLines.pipeline.consolidation',
  },
];

interface RequestLinePipelineIconsProps {
  links: RequestLineLinks;
}

export function RequestLinePipelineIcons({
  links,
}: RequestLinePipelineIconsProps) {
  const { t } = useTranslation('requests');

  return (
    <Stack
      direction="row"
      spacing={0.25}
      alignItems="center"
      useFlexGap
      flexWrap="wrap"
    >
      {PIPELINE_STAGES.map(({ key, icon: Icon, labelKey }) => {
        const active = links[key];
        if (!active) return null;

        const label = t(labelKey);

        return (
          <Tooltip key={key} title={label}>
            <Box
              component="span"
              aria-label={label}
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                p: 0.25,
                color: active ? 'primary.main' : 'action.disabled',
              }}
            >
              <Icon fontSize="small" />
            </Box>
          </Tooltip>
        );
      }).filter(Boolean)}
    </Stack>
  );
}
