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
  showExtendedFilters?: boolean;
  drawerOpen: boolean;
  onDrawerOpenChange: (open: boolean) => void;
  onDraftChange: (next: RequestsFiltersValue) => void;
  onApply: () => void;
  onReset: () => void;
}

export function RequestsFiltersPanel({
  draftFilters,
  appliedFilters,
  statusOptions,
  showExtendedFilters = false,
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
    <FiltersDrawer
      open={drawerOpen}
      onClose={() => onDrawerOpenChange(false)}
      title={t('filters.title')}
      closeAriaLabel={t('filters.closeAriaLabel')}
      applyLabel={t('filters.apply')}
      resetLabel={t('filters.reset')}
      onApply={handleApply}
      onReset={onReset}
      applyDisabled={!isDirty}
      width={{ xs: '100%', sm: 420 }}
    >
      <RequestsFiltersForm
        filters={draftFilters}
        statusOptions={statusOptions}
        showExtendedFilters={showExtendedFilters}
        onChange={onDraftChange}
      />
    </FiltersDrawer>
  );
}
