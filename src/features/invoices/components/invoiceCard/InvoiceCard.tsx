import { Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

import type { GetCompaniesCompanyIdInvoicesDirection } from '@/api/generated/models/getCompaniesCompanyIdInvoicesDirection';
import type { SupplierInvoiceSummary } from '@/api/generated/models/supplierInvoiceSummary';
import { DecimalDisplay } from '@/components/dataDisplay/decimalDisplay/DecimalDisplay';
import { DocumentListItemLayout } from '@/components/layouts/documentListItemLayout/DocumentListItemLayout';
import { InvoiceStatusBadge } from '@/components/status/invoiceStatusBadge/InvoiceStatusBadge';
import { formatLocalizedDate } from '@/lib/dateFormat';

interface InvoiceCardProps {
  invoice: SupplierInvoiceSummary;
  direction: GetCompaniesCompanyIdInvoicesDirection;
  onClick: () => void;
}

export function InvoiceCard({ invoice, direction, onClick }: InvoiceCardProps) {
  const { t, i18n } = useTranslation('invoices');
  const isBuyerView = direction === 'inbound';

  const counterpartyName = isBuyerView
    ? (invoice.supplierCompany?.name ?? '—')
    : (invoice.buyerCompany?.name ?? '—');

  const numberText = t('detail.titleWithNumber', { number: invoice.number ?? '—' });
  const createdAtText = formatLocalizedDate(invoice.createdAt, i18n.language);
  const issuedAtText = formatLocalizedDate(invoice.issuedAt, i18n.language);

  return (
    <DocumentListItemLayout
      onClick={onClick}
      content={
        <>
          <Typography variant="subtitle1" fontWeight={600} noWrap>
            {numberText}
          </Typography>

          <Typography variant="subtitle2" fontWeight={500} noWrap>
            {counterpartyName}
          </Typography>

          <Typography variant="body1" noWrap>
            <DecimalDisplay value={invoice.totalAmount} suffix={invoice.currency} groupDigits /> 
            {/* {' · '} */}
            {/* {`${t('columns.linesCount')}: ${invoice.linesCount}`} */}
          </Typography>

          <Typography variant="body2" color="text.secondary">
            {createdAtText}
            {/* {' · '} */}
            {/* {createdByName} */}
            {invoice.issuedAt ? ` · ${t('columns.issuedAt')}: ${issuedAtText}` : ''}
          </Typography>
        </>
      }
      aside={<InvoiceStatusBadge status={invoice.status} />}
    />
  );
}
