import { useTranslation } from 'react-i18next';

import { FiltersDrawer } from '@/components/filters/filtersDrawer/FiltersDrawer';
import {
  RequestsFiltersForm,
  type RequestsBuyerOption,
  type RequestsMemberOption,
} from '@/features/requests/components/requestsFilters/RequestsFiltersForm';
import {
  areRequestsFiltersEqual,
  type RequestsFiltersValue,
  type RequestsTab,
} from '@/features/requests/lib/requestsFilters';
import type { MaterialRequestStatus } from '@/types/api';

interface RequestsFiltersPanelProps {
  draftFilters: RequestsFiltersValue;
  appliedFilters: RequestsFiltersValue;
  statusOptions: Array<MaterialRequestStatus | 'ALL'>;
  tab: RequestsTab;
  buyerOptions?: RequestsBuyerOption[];
  memberOptions?: RequestsMemberOption[];
  canFilterByMember?: boolean;
  currentUserId?: string | null;
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
  tab,
  buyerOptions,
  memberOptions,
  canFilterByMember = false,
  currentUserId = null,
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
        tab={tab}
        buyerOptions={buyerOptions}
        memberOptions={memberOptions}
        canFilterByMember={canFilterByMember}
        currentUserId={currentUserId}
        onChange={onDraftChange}
      />
    </FiltersDrawer>
  );
}
