import { Stack } from '@mui/material';
import type { TradingPartner } from '@/api/generated/models/tradingPartner';
import type { GetCompaniesCompanyIdInvoicesDirection } from '@/api/generated/models/getCompaniesCompanyIdInvoicesDirection';

import type { InvoicesFiltersValue } from '@/features/invoices/lib/invoicesFilters';
import { InvoiceStatusFilter } from '@/features/invoices/components/invoicesFilters/InvoiceStatusFilter';
import { InvoiceCounterpartyAutocomplete } from '@/features/invoices/components/invoicesFilters/InvoiceCounterpartyAutocomplete';
import { InvoiceCurrencyFilter } from '@/features/invoices/components/invoicesFilters/InvoiceCurrencyFilter';
import { InvoiceNumberFilter } from '@/features/invoices/components/invoicesFilters/InvoiceNumberFilter';
import { InvoiceCreatedDateRangeFilter } from '@/features/invoices/components/invoicesFilters/InvoiceCreatedDateRangeFilter';

interface InvoicesFiltersFormProps {
  direction: GetCompaniesCompanyIdInvoicesDirection;
  filters: InvoicesFiltersValue;
  partners: TradingPartner[];
  partnersLoading: boolean;
  onChange: (next: InvoicesFiltersValue) => void;
}

export function InvoicesFiltersForm({
  direction,
  filters,
  partners,
  partnersLoading,
  onChange,
}: InvoicesFiltersFormProps) {
  return (
    <Stack
      spacing={2}
      direction={{ xs: 'column', sm: 'row' }}
      alignItems={{ xs: 'stretch', sm: 'flex-end' }}
      flexWrap="wrap"
    >
      <InvoiceStatusFilter
        value={filters.status}
        onChange={(status) => onChange({ ...filters, status })}
      />

      <InvoiceCounterpartyAutocomplete
        direction={direction}
        value={filters.counterpartyCompanyId}
        options={partners}
        loading={partnersLoading}
        onChange={(nextId) =>
          onChange({ ...filters, counterpartyCompanyId: nextId })
        }
      />

      <InvoiceCurrencyFilter
        value={filters.currency}
        onChange={(next) => onChange({ ...filters, currency: next })}
      />

      <InvoiceNumberFilter
        value={filters.invoiceNumber}
        onChange={(invoiceNumber) => onChange({ ...filters, invoiceNumber })}
      />

      <InvoiceCreatedDateRangeFilter
        createdFrom={filters.createdFrom}
        createdTo={filters.createdTo}
        onChange={({ createdFrom, createdTo }) =>
          onChange({ ...filters, createdFrom, createdTo })
        }
      />
    </Stack>
  );
}
