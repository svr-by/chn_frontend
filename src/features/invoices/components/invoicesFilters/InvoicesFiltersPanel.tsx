import { useTranslation } from 'react-i18next';

import type { TradingPartner } from '@/api/generated/models/tradingPartner';
import type { GetCompaniesCompanyIdInvoicesDirection } from '@/api/generated/models/getCompaniesCompanyIdInvoicesDirection';
import {
  areInvoicesFiltersEqual,
  type InvoicesFiltersValue,
} from '@/features/invoices/lib/invoicesFilters';
import { FiltersDrawer } from '@/components/FiltersDrawer';
import { InvoicesFiltersForm } from '@/features/invoices/components/invoicesFilters/InvoicesFiltersForm';

interface InvoicesFiltersPanelProps {
  direction: GetCompaniesCompanyIdInvoicesDirection;
  draftFilters: InvoicesFiltersValue;
  appliedFilters: InvoicesFiltersValue;
  partners: TradingPartner[];
  partnersLoading: boolean;
  drawerOpen: boolean;
  onDrawerOpenChange: (open: boolean) => void;
  onDraftChange: (next: InvoicesFiltersValue) => void;
  onApply: () => void;
  onReset: () => void;
}

export function InvoicesFiltersPanel({
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
}: InvoicesFiltersPanelProps) {
  const { t } = useTranslation('invoices');

  const isDirty = !areInvoicesFiltersEqual(draftFilters, appliedFilters);

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
      <InvoicesFiltersForm
        direction={direction}
        filters={draftFilters}
        partners={partners}
        partnersLoading={partnersLoading}
        onChange={onDraftChange}
      />
    </FiltersDrawer>
  );
}
