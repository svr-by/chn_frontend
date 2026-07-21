import { useMemo } from 'react';
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

import { GetCompaniesCompanyIdRequestLinesInboundStatus } from '@/api/generated/models/getCompaniesCompanyIdRequestLinesInboundStatus';
import type { GetCompaniesCompanyIdRequestLinesInboundStatus as InboundRequestLineStatusFilter } from '@/api/generated/models/getCompaniesCompanyIdRequestLinesInboundStatus';
import { FiltersDrawer } from '@/components/FiltersDrawer';

export type InboundRequestLinesStatusFilter = InboundRequestLineStatusFilter | 'ALL';

export interface InboundRequestLinesFilterState {
  q: string;
  status: InboundRequestLinesStatusFilter;
  requestId: string;
  withoutQuotes: boolean;
}

export const EMPTY_INBOUND_REQUEST_LINES_FILTERS: InboundRequestLinesFilterState =
  {
    q: '',
    status: 'ALL',
    requestId: '',
    withoutQuotes: false,
  };

interface InboundRequestLinesFiltersDrawerProps {
  open: boolean;
  onClose: () => void;
  value: InboundRequestLinesFilterState;
  onChange: (value: InboundRequestLinesFilterState) => void;
  onApply: () => void;
  onReset: () => void;
}

export function InboundRequestLinesFiltersDrawer({
  open,
  onClose,
  value,
  onChange,
  onApply,
  onReset,
}: InboundRequestLinesFiltersDrawerProps) {
  const { t } = useTranslation('requests');

  const statusOptions = useMemo(
    () =>
      ['ALL', ...Object.values(GetCompaniesCompanyIdRequestLinesInboundStatus)] as const,
    [],
  );

  return (
    <FiltersDrawer
      open={open}
      onClose={onClose}
      title={t('requestLines.inbound.filters.title')}
      closeAriaLabel={t('requestLines.filters.close')}
      onApply={onApply}
      onReset={onReset}
      applyLabel={t('requestLines.filters.apply')}
      resetLabel={t('requestLines.filters.reset')}
    >
      <Stack spacing={2}>
        <TextField
          label={t('requestLines.filters.q')}
          value={value.q}
          onChange={(event) => onChange({ ...value, q: event.target.value })}
          fullWidth
        />
        <FormControl fullWidth>
          <InputLabel id="inbound-lines-status-filter">
            {t('requestLines.filters.status')}
          </InputLabel>
          <Select
            labelId="inbound-lines-status-filter"
            label={t('requestLines.filters.status')}
            value={value.status}
            onChange={(event) =>
              onChange({
                ...value,
                status: event.target.value as InboundRequestLinesStatusFilter,
              })
            }
          >
            {statusOptions.map((status) => (
              <MenuItem key={status} value={status}>
                {status === 'ALL'
                  ? t('statusFilter.all')
                  : t(`statusFilter.${status.toLowerCase()}`, {
                      defaultValue: status,
                    })}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <TextField
          label={t('requestLines.inbound.filters.requestId')}
          value={value.requestId}
          onChange={(event) =>
            onChange({ ...value, requestId: event.target.value })
          }
          fullWidth
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={value.withoutQuotes}
              onChange={(event) =>
                onChange({ ...value, withoutQuotes: event.target.checked })
              }
            />
          }
          label={t('requestLines.inbound.filters.withoutQuotes')}
        />
      </Stack>
    </FiltersDrawer>
  );
}
