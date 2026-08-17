import { useTranslation } from 'react-i18next';

import { FiltersDrawer } from '@/components/FiltersDrawer';
import {
  RequestLinesFiltersForm,
  type RequestLinesCreatedByOption,
} from '@/features/requests/components/requestLinesFilters/RequestLinesFiltersForm';
import {
  areRequestLinesFiltersEqual,
  type RequestLinesFiltersValue,
} from '@/features/requests/lib/requestLinesFilters';
import type { MaterialRequestStatus } from '@/types/api';

interface RequestLinesFiltersPanelProps {
  draftFilters: RequestLinesFiltersValue;
  appliedFilters: RequestLinesFiltersValue;
  statusOptions: Array<MaterialRequestStatus | 'ALL'>;
  createdByOptions: RequestLinesCreatedByOption[];
  showExtendedFilters?: boolean;
  drawerOpen: boolean;
  onDrawerOpenChange: (open: boolean) => void;
  onDraftChange: (next: RequestLinesFiltersValue) => void;
  onApply: () => void;
  onReset: () => void;
}

export function RequestLinesFiltersPanel({
  draftFilters,
  appliedFilters,
  statusOptions,
  createdByOptions,
  showExtendedFilters = false,
  drawerOpen,
  onDrawerOpenChange,
  onDraftChange,
  onApply,
  onReset,
}: RequestLinesFiltersPanelProps) {
  const { t } = useTranslation('requests');

  const isDirty = !areRequestLinesFiltersEqual(draftFilters, appliedFilters);

  function handleApply() {
    onApply();
    onDrawerOpenChange(false);
  }

  return (
    <FiltersDrawer
      open={drawerOpen}
      onClose={() => onDrawerOpenChange(false)}
      title={t('requestLines.filters.title')}
      closeAriaLabel={t('requestLines.filters.close')}
      applyLabel={t('requestLines.filters.apply')}
      resetLabel={t('requestLines.filters.reset')}
      onApply={handleApply}
      onReset={onReset}
      applyDisabled={!isDirty}
      width={{ xs: '100%', sm: 420 }}
    >
      <RequestLinesFiltersForm
        filters={draftFilters}
        statusOptions={statusOptions}
        createdByOptions={createdByOptions}
        showExtendedFilters={showExtendedFilters}
        onChange={onDraftChange}
      />
    </FiltersDrawer>
  );
}
