import { Stack } from '@mui/material';
import type { TradingPartner } from '@/api/generated/models/tradingPartner';
import type { GetCompaniesCompanyIdQuotesDirection } from '@/api/generated/models/getCompaniesCompanyIdQuotesDirection';

import type { QuotesFiltersValue } from '@/features/quotes/lib/quotesFilters';
import { QuoteStatusFilter } from '@/features/quotes/components/quotesFilters/QuoteStatusFilter';
import { QuoteCounterpartyAutocomplete } from '@/features/quotes/components/quotesFilters/QuoteCounterpartyAutocomplete';
import { QuoteCurrencyFilter } from '@/features/quotes/components/quotesFilters/QuoteCurrencyFilter';
import { QuoteCreatedDateRangeFilter } from '@/features/quotes/components/quotesFilters/QuoteCreatedDateRangeFilter';

interface QuotesFiltersFormProps {
  direction: GetCompaniesCompanyIdQuotesDirection;
  filters: QuotesFiltersValue;
  partners: TradingPartner[];
  partnersLoading: boolean;
  onChange: (next: QuotesFiltersValue) => void;
}

export function QuotesFiltersForm({
  direction,
  filters,
  partners,
  partnersLoading,
  onChange,
}: QuotesFiltersFormProps) {
  return (
    <Stack
      spacing={2}
      direction={{ xs: 'column', sm: 'row' }}
      alignItems={{ xs: 'stretch', sm: 'flex-end' }}
      flexWrap="wrap"
    >
      <QuoteStatusFilter
        value={filters.status}
        onChange={(status) => onChange({ ...filters, status })}
      />

      <QuoteCounterpartyAutocomplete
        direction={direction}
        value={filters.counterpartyCompanyId}
        options={partners}
        loading={partnersLoading}
        onChange={(nextId) =>
          onChange({ ...filters, counterpartyCompanyId: nextId })
        }
      />

      <QuoteCurrencyFilter
        value={filters.currency}
        onChange={(next) => onChange({ ...filters, currency: next })}
      />

      <QuoteCreatedDateRangeFilter
        createdFrom={filters.createdFrom}
        createdTo={filters.createdTo}
        onChange={({ createdFrom, createdTo }) =>
          onChange({ ...filters, createdFrom, createdTo })
        }
      />
    </Stack>
  );
}
