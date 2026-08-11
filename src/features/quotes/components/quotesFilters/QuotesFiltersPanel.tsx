import { useTranslation } from 'react-i18next';

import type { TradingPartner } from '@/api/generated/models/tradingPartner';
import type { GetCompaniesCompanyIdQuotesDirection } from '@/api/generated/models/getCompaniesCompanyIdQuotesDirection';
import {
  areQuotesFiltersEqual,
  type QuotesFiltersValue,
} from '@/features/quotes/lib/quotesFilters';
import { FiltersDrawer } from '@/components/FiltersDrawer';
import { QuotesFiltersForm } from '@/features/quotes/components/quotesFilters/QuotesFiltersForm';

interface QuotesFiltersPanelProps {
  direction: GetCompaniesCompanyIdQuotesDirection;
  draftFilters: QuotesFiltersValue;
  appliedFilters: QuotesFiltersValue;
  partners: TradingPartner[];
  partnersLoading: boolean;
  drawerOpen: boolean;
  onDrawerOpenChange: (open: boolean) => void;
  onDraftChange: (next: QuotesFiltersValue) => void;
  onApply: () => void;
  onReset: () => void;
}

export function QuotesFiltersPanel({
  direction,
  draftFilters,
  appliedFilters,
  partners,
  partnersLoading,
  drawerOpen,
  onDrawerOpenChange,
  onDraftChange,
  onApply,
  onReset,
}: QuotesFiltersPanelProps) {
  const { t } = useTranslation('quotes');

  const isDirty = !areQuotesFiltersEqual(draftFilters, appliedFilters);

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
      <QuotesFiltersForm
        direction={direction}
        filters={draftFilters}
        partners={partners}
        partnersLoading={partnersLoading}
        onChange={onDraftChange}
      />
    </FiltersDrawer>
  );
}
