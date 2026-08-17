import {
  Checkbox,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
} from '@mui/material';
import { useTranslation } from 'react-i18next';

import { RequestStatusFilter } from '@/features/requests/components/requestsFilters/RequestStatusFilter';
import type { RequestLinesFiltersValue } from '@/features/requests/lib/requestLinesFilters';
import type { MaterialRequestStatus } from '@/types/api';

export type RequestLinesCreatedByOption = {
  label: string;
  value: string;
};

interface RequestLinesFiltersFormProps {
  filters: RequestLinesFiltersValue;
  statusOptions: Array<MaterialRequestStatus | 'ALL'>;
  createdByOptions: RequestLinesCreatedByOption[];
  showExtendedFilters?: boolean;
  onChange: (next: RequestLinesFiltersValue) => void;
}

export function RequestLinesFiltersForm({
  filters,
  statusOptions,
  createdByOptions,
  showExtendedFilters = false,
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

      <RequestStatusFilter
        value={filters.status}
        options={statusOptions}
        onChange={(status) => onChange({ ...filters, status })}
      />

      {showExtendedFilters ? (
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

          <FormControlLabel
            control={
              <Checkbox
                checked={filters.undistributed}
                onChange={(event) =>
                  onChange({
                    ...filters,
                    undistributed: event.target.checked,
                  })
                }
              />
            }
            label={t('requestLines.filters.undistributed')}
          />
        </>
      ) : null}

      <FormControlLabel
        control={
          <Checkbox
            checked={filters.withoutQuotes}
            onChange={(event) =>
              onChange({
                ...filters,
                withoutQuotes: event.target.checked,
              })
            }
          />
        }
        label={t('requestLines.filters.withoutQuotes')}
      />
    </Stack>
  );
}
