import { Box, Button, Stack } from '@mui/material';
import { useTranslation } from 'react-i18next';

import { FiltersDrawer } from '@/components/FiltersDrawer';
import { RequestsFiltersForm } from '@/features/requests/components/requestsFilters/RequestsFiltersForm';
import {
  areRequestsFiltersEqual,
  type RequestsFiltersValue,
} from '@/features/requests/lib/requestsFilters';
import type { MaterialRequestStatus } from '@/types/api';

interface RequestsFiltersPanelProps {
  draftFilters: RequestsFiltersValue;
  appliedFilters: RequestsFiltersValue;
  statusOptions: Array<MaterialRequestStatus | 'ALL'>;
  inline?: boolean;
  drawerOpen: boolean;
  onDrawerOpenChange: (open: boolean) => void;
  onDraftChange: (next: RequestsFiltersValue) => void;
  onApply: () => void;
  onReset: () => void;
}

function RequestsFiltersActions({
  isDirty,
  onApply,
  onReset,
}: {
  isDirty: boolean;
  onApply: () => void;
  onReset: () => void;
}) {
  const { t } = useTranslation('requests');

  return (
    <Stack direction="row" spacing={1} sx={{ flexShrink: 0 }}>
      <Button size="small" onClick={onReset}>
        {t('filters.reset')}
      </Button>
      <Button
        size="small"
        variant="contained"
        onClick={onApply}
        disabled={!isDirty}
      >
        {t('filters.apply')}
      </Button>
    </Stack>
  );
}

export function RequestsFiltersPanel({
  draftFilters,
  appliedFilters,
  statusOptions,
  inline = true,
  drawerOpen,
  onDrawerOpenChange,
  onDraftChange,
  onApply,
  onReset,
}: RequestsFiltersPanelProps) {
  const { t } = useTranslation('requests');

  const isDirty = !areRequestsFiltersEqual(draftFilters, appliedFilters);

  function handleApply() {
    onApply();
    onDrawerOpenChange(false);
  }

  return (
    <>
      {inline ? (
        <Stack
          direction="row"
          spacing={1}
          alignItems="flex-end"
          flexWrap="wrap"
          useFlexGap
        >
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <RequestsFiltersForm
              filters={draftFilters}
              statusOptions={statusOptions}
              onChange={onDraftChange}
            />
          </Box>
          <RequestsFiltersActions
            isDirty={isDirty}
            onApply={onApply}
            onReset={onReset}
          />
        </Stack>
      ) : null}

      <FiltersDrawer
        open={drawerOpen}
        onClose={() => onDrawerOpenChange(false)}
        title={t('filters.title')}
        closeAriaLabel={t('filters.closeAriaLabel')}
        applyLabel={t('filters.apply')}
        resetLabel={t('filters.reset')}
        onApply={handleApply}
        onReset={onReset}
        width={{ xs: '100%', sm: 420 }}
      >
        <RequestsFiltersForm
          filters={draftFilters}
          statusOptions={statusOptions}
          onChange={onDraftChange}
        />
      </FiltersDrawer>
    </>
  );
}
