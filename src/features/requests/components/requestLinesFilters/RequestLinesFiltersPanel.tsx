import { useTranslation } from 'react-i18next';

import { FiltersDrawer } from '@/components/filters/filtersDrawer/FiltersDrawer';
import {
  RequestLinesFiltersForm,
  type RequestLinesBuyerOption,
  type RequestLinesCreatedByOption,
} from '@/features/requests/components/requestLinesFilters/RequestLinesFiltersForm';
import {
  areRequestLinesFiltersEqual,
  type RequestLinesFiltersValue,
} from '@/features/requests/lib/requestLinesFilters';

interface RequestLinesFiltersPanelProps {
  draftFilters: RequestLinesFiltersValue;
  appliedFilters: RequestLinesFiltersValue;
  createdByOptions: RequestLinesCreatedByOption[];
  buyerOptions: RequestLinesBuyerOption[];
  showOutboundFilters?: boolean;
  showInboundFilters?: boolean;
  drawerOpen: boolean;
  onDrawerOpenChange: (open: boolean) => void;
  onDraftChange: (next: RequestLinesFiltersValue) => void;
  onApply: () => void;
  onReset: () => void;
}

export function RequestLinesFiltersPanel({
  draftFilters,
  appliedFilters,
  createdByOptions,
  buyerOptions,
  showOutboundFilters = false,
  showInboundFilters = false,
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
      width={{ xs: '100%', sm: 480 }}
    >
      <RequestLinesFiltersForm
        filters={draftFilters}
        createdByOptions={createdByOptions}
        buyerOptions={buyerOptions}
        showOutboundFilters={showOutboundFilters}
        showInboundFilters={showInboundFilters}
        onChange={onDraftChange}
      />
    </FiltersDrawer>
  );
}
