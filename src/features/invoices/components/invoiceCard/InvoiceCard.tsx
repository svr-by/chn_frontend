import { Paper, Stack, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

import type { GetCompaniesCompanyIdInvoicesDirection } from '@/api/generated/models/getCompaniesCompanyIdInvoicesDirection';
import type { SupplierInvoiceSummary } from '@/api/generated/models/supplierInvoiceSummary';
import { InvoiceStatusBadge } from '@/components/InvoiceStatusBadge';

interface InvoiceCardProps {
  invoice: SupplierInvoiceSummary;
  direction: GetCompaniesCompanyIdInvoicesDirection;
  onClick: () => void;
}

function formatDateTime(value: string | null | undefined): string {
  if (!value) return '—';
  return new Date(value).toLocaleDateString();
}

export function InvoiceCard({ invoice, direction, onClick }: InvoiceCardProps) {
  const { t } = useTranslation('invoices');
  const isBuyerView = direction === 'outbound';

  const counterpartyName = isBuyerView
    ? (invoice.buyerCompany?.name ?? '—')
    : (invoice.supplierCompany?.name ?? '—');

  const numberText = invoice.number || '—';
  const createdAtText = formatDateTime(invoice.createdAt);
  const issuedAtText = formatDateTime(invoice.issuedAt);

  return (
    <Paper
      component="button"
      type="button"
      variant="outlined"
      onClick={onClick}
      sx={{
        width: '100%',
        textAlign: 'left',
        cursor: 'pointer',
        p: 2,
        borderRadius: 1,
        bgcolor: 'background.paper',
        borderColor: 'divider',
        transition: (theme) =>
          theme.transitions.create(['border-color', 'background-color'], {
            duration: theme.transitions.duration.shorter,
          }),
        '&:hover': {
          borderColor: 'primary.main',
          bgcolor: 'action.hover',
        },
        '&:focus-visible': {
          outline: (theme) => `2px solid ${theme.palette.primary.main}`,
          outlineOffset: 2,
        },
      }}
    >
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={1.5}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', sm: 'center' }}
      >
        <Stack spacing={0.5} sx={{ minWidth: 0, flex: 1 }}>
          <Typography variant="subtitle1" fontWeight={600} noWrap>
            {counterpartyName}
          </Typography>

          <Typography variant="body2" color="text.secondary" noWrap>
            {`${t('columns.invoiceNumber')}: ${numberText} · ${invoice.currency}`}
          </Typography>

          <Typography variant="body2" color="text.secondary">
            {t('columns.createdAt')}: {createdAtText}
            {' / '}
            {t('columns.issuedAt')}: {issuedAtText}
          </Typography>
        </Stack>

        <InvoiceStatusBadge status={invoice.status} />
      </Stack>
    </Paper>
  );
}
