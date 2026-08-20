import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import { useTranslation } from 'react-i18next';

import type {
  PipelineFilterValue,
  RequestLinesFiltersValue,
} from '@/features/requests/lib/requestLinesFilters';

export type RequestLinesCreatedByOption = {
  label: string;
  value: string;
};

export type RequestLinesBuyerOption = {
  label: string;
  value: string;
};

interface RequestLinesFiltersFormProps {
  filters: RequestLinesFiltersValue;
  createdByOptions: RequestLinesCreatedByOption[];
  buyerOptions: RequestLinesBuyerOption[];
  showOutboundFilters?: boolean;
  showInboundFilters?: boolean;
  onChange: (next: RequestLinesFiltersValue) => void;
}

const PIPELINE_FILTER_VALUES: PipelineFilterValue[] = ['any', 'true', 'false'];

function PipelineFilterSelect({
  label,
  value,
  onChange,
}: {
  label: string;
  value: PipelineFilterValue;
  onChange: (next: PipelineFilterValue) => void;
}) {
  const { t } = useTranslation('requests');

  return (
    <Stack spacing={1} sx={{ width: '100%', minWidth: 0 }}>
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      <ToggleButtonGroup
        exclusive
        size="small"
        fullWidth
        value={value}
        onChange={(_event, nextValue: PipelineFilterValue | null) => {
          if (nextValue) {
            onChange(nextValue);
          }
        }}
      >
        {PIPELINE_FILTER_VALUES.map((option) => (
          <ToggleButton key={option} value={option}>
            {t(`requestLines.filters.filter${option === 'any' ? 'Any' : option === 'true' ? 'Yes' : 'No'}`)}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
    </Stack>
  );
}

export function RequestLinesFiltersForm({
  filters,
  createdByOptions,
  buyerOptions,
  showOutboundFilters = false,
  showInboundFilters = false,
  onChange,
}: RequestLinesFiltersFormProps) {
  const { t } = useTranslation('requests');

  return (
    <Stack spacing={2}>
      <TextField
        label={t('requestLines.filters.q')}
        value={filters.q}
        onChange={(event) => onChange({ ...filters, q: event.target.value })}
        size="small"
        sx={{ width: '100%', minWidth: 0 }}
      />

      {showOutboundFilters ? (
        <>
          <FormControl size="small" sx={{ width: '100%', minWidth: 0 }}>
            <InputLabel id="request-lines-created-by-filter">
              {t('requestLines.filters.createdBy')}
            </InputLabel>
            <Select
              labelId="request-lines-created-by-filter"
              label={t('requestLines.filters.createdBy')}
              value={filters.createdByUserId}
              onChange={(event) =>
                onChange({
                  ...filters,
                  createdByUserId: event.target.value,
                })
              }
            >
              {createdByOptions.map((option) => (
                <MenuItem key={option.value || 'all'} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Typography variant="overline" color="text.secondary">
            {t('requestLines.filters.pipelineSection')}
          </Typography>

          <PipelineFilterSelect
            label={t('requestLines.filters.distributed')}
            value={filters.distributed}
            onChange={(distributed) => onChange({ ...filters, distributed })}
          />
          <PipelineFilterSelect
            label={t('requestLines.filters.quoted')}
            value={filters.quoted}
            onChange={(quoted) => onChange({ ...filters, quoted })}
          />
          <PipelineFilterSelect
            label={t('requestLines.filters.selected')}
            value={filters.selected}
            onChange={(selected) => onChange({ ...filters, selected })}
          />
          <PipelineFilterSelect
            label={t('requestLines.filters.invoiced')}
            value={filters.invoiced}
            onChange={(invoiced) => onChange({ ...filters, invoiced })}
          />
          <PipelineFilterSelect
            label={t('requestLines.filters.shipped')}
            value={filters.shipped}
            onChange={(shipped) => onChange({ ...filters, shipped })}
          />
        </>
      ) : null}

      {showInboundFilters ? (
        <>
          <FormControl size="small" sx={{ width: '100%', minWidth: 0 }}>
            <InputLabel id="request-lines-buyer-filter">
              {t('requestLines.filters.buyerCompany')}
            </InputLabel>
            <Select
              labelId="request-lines-buyer-filter"
              label={t('requestLines.filters.buyerCompany')}
              value={filters.buyerCompanyId}
              onChange={(event) =>
                onChange({
                  ...filters,
                  buyerCompanyId: event.target.value,
                })
              }
            >
              {buyerOptions.map((option) => (
                <MenuItem key={option.value || 'all'} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <PipelineFilterSelect
            label={t('requestLines.filters.quoted')}
            value={filters.quoted}
            onChange={(quoted) => onChange({ ...filters, quoted })}
          />
        </>
      ) : null}
    </Stack>
  );
}
