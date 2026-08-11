import { FormControl, InputLabel, MenuItem, Select } from '@mui/material';
import { useTranslation } from 'react-i18next';

import type { MaterialRequestStatus } from '@/types/api';

interface RequestStatusFilterProps {
  value: MaterialRequestStatus | 'ALL';
  options: Array<MaterialRequestStatus | 'ALL'>;
  onChange: (next: MaterialRequestStatus | 'ALL') => void;
}

export function RequestStatusFilter({
  value,
  options,
  onChange,
}: RequestStatusFilterProps) {
  const { t } = useTranslation('requests');

  return (
    <FormControl size="small" sx={{ width: '100%', minWidth: 0 }}>
      <InputLabel id="request-status-filter">{t('statusFilter.label')}</InputLabel>
      <Select
        labelId="request-status-filter"
        label={t('statusFilter.label')}
        value={value}
        onChange={(event) => {
          onChange(event.target.value as MaterialRequestStatus | 'ALL');
        }}
      >
        {options.map((status) => (
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
  );
}
