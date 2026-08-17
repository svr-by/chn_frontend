import { useMemo } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Link, Stack, Typography } from '@mui/material';
import type { MRT_ColumnDef } from 'material-react-table';
import { useTranslation } from 'react-i18next';

import type { InvoicePaymentSummary } from '@/api/generated/models/invoicePaymentSummary';
import { DecimalDisplay } from '@/components/DecimalDisplay';
import { SimpleTable } from '@/components/SimpleTable';
import { PaymentStatusBadge } from '@/components/PaymentStatusBadge';

interface InvoicePaymentsTableProps {
  payments: InvoicePaymentSummary[];
  currency: string;
}

export function InvoicePaymentsTable({
  payments,
  currency,
}: InvoicePaymentsTableProps) {
  const { t } = useTranslation('invoices');

  const columns = useMemo<MRT_ColumnDef<InvoicePaymentSummary>[]>(
    () => [
      {
        accessorKey: 'status',
        header: t('paymentsColumns.status'),
        Cell: ({ cell }) => (
          <PaymentStatusBadge
            status={cell.getValue<InvoicePaymentSummary['status']>()}
          />
        ),
      },
      {
        accessorKey: 'amount',
        header: t('paymentsColumns.amount'),
        Cell: ({ cell }) => (
          <DecimalDisplay
            value={cell.getValue<string>()}
            suffix={currency}
            groupDigits
          />
        ),
      },
      {
        id: 'link',
        header: t('paymentsColumns.actions'),
        Cell: ({ row }) => (
          <Link component={RouterLink} to={`/app/payments/${row.original.id}`}>
            {t('actions.viewPayment')}
          </Link>
        ),
      },
    ],
    [currency, t],
  );

  if (payments.length === 0) {
    return null;
  }

  return (
    <Stack spacing={1}>
      <Typography variant="h6">{t('paymentsTitle')}</Typography>
      <SimpleTable columns={columns} data={payments} />
    </Stack>
  );
}
