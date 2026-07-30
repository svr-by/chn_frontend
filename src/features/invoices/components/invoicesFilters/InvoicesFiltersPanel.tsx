import { Box, Button, Stack } from '@mui/material';
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
  inline?: boolean;
  drawerOpen: boolean;
  onDrawerOpenChange: (open: boolean) => void;
  onDraftChange: (next: InvoicesFiltersValue) => void;
  onApply: () => void;
  onReset: () => void;
}

function InvoicesFiltersActions({
  isDirty,
  onApply,
  onReset,
}: {
  isDirty: boolean;
  onApply: () => void;
  onReset: () => void;
}) {
  const { t } = useTranslation('invoices');

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

export function InvoicesFiltersPanel({
  direction,
  draftFilters,
  appliedFilters,
  partners,
  partnersLoading,
  inline = true,
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
            <InvoicesFiltersForm
              direction={direction}
              filters={draftFilters}
              partners={partners}
              partnersLoading={partnersLoading}
              onChange={onDraftChange}
            />
          </Box>
          <InvoicesFiltersActions
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
        <InvoicesFiltersForm
          direction={direction}
          filters={draftFilters}
          partners={partners}
          partnersLoading={partnersLoading}
          onChange={onDraftChange}
        />
      </FiltersDrawer>
    </>
  );
}
