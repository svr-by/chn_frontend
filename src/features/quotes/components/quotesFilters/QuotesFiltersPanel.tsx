import { Box, Button, Stack } from '@mui/material';
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
  inline?: boolean;
  drawerOpen: boolean;
  onDrawerOpenChange: (open: boolean) => void;
  onDraftChange: (next: QuotesFiltersValue) => void;
  onApply: () => void;
  onReset: () => void;
}

function QuotesFiltersActions({
  isDirty,
  onApply,
  onReset,
}: {
  isDirty: boolean;
  onApply: () => void;
  onReset: () => void;
}) {
  const { t } = useTranslation('quotes');

  return (
    <Stack direction="row" spacing={1} sx={{ flexShrink: 0 }}>
      <Button size="small" onClick={onReset}>
        {t('filters.reset')}
      </Button>
      <Button size="small" variant="contained" onClick={onApply} disabled={!isDirty}>
        {t('filters.apply')}
      </Button>
    </Stack>
  );
}

export function QuotesFiltersPanel({
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
}: QuotesFiltersPanelProps) {
  const { t } = useTranslation('quotes');

  const isDirty = !areQuotesFiltersEqual(draftFilters, appliedFilters);

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
            <QuotesFiltersForm
              direction={direction}
              filters={draftFilters}
              partners={partners}
              partnersLoading={partnersLoading}
              onChange={onDraftChange}
            />
          </Box>
          <QuotesFiltersActions
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
        <QuotesFiltersForm
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
