import { Stack } from '@mui/material';

import type { RequestsFiltersValue } from '@/features/requests/lib/requestsFilters';
import type { MaterialRequestStatus } from '@/types/api';
import { RequestStatusFilter } from '@/features/requests/components/requestsFilters/RequestStatusFilter';

interface RequestsFiltersFormProps {
  filters: RequestsFiltersValue;
  statusOptions: Array<MaterialRequestStatus | 'ALL'>;
  onChange: (next: RequestsFiltersValue) => void;
}

export function RequestsFiltersForm({
  filters,
  statusOptions,
  onChange,
}: RequestsFiltersFormProps) {
  return (
    <Stack
      spacing={2}
      direction={{ xs: 'column', sm: 'row' }}
      alignItems={{ xs: 'stretch', sm: 'flex-end' }}
      flexWrap="wrap"
    >
      <RequestStatusFilter
        value={filters.status}
        options={statusOptions}
        onChange={(status) => onChange({ ...filters, status })}
      />
    </Stack>
  );
}
