import type { ReactNode } from 'react';
import { Stack, Typography } from '@mui/material';
import type { MRT_ColumnDef } from 'material-react-table';
import type { TFunction } from 'i18next';

import type { InvoiceLine } from '@/api/generated/models/invoiceLine';
import { DecimalDisplay } from '@/components/DecimalDisplay';
import { LineRowActionsMenu } from '@/components/LineRowActionsMenu';
import { RequestLineCancelledBadge } from '@/components/RequestLineCancelledBadge';
import {
  MRT_NARROW_ACTIONS_SIZE,
  MRT_NARROW_LINE_NUMBER_SIZE,
  mrtFixedSizeColumnProps,
} from '@/lib/mrtNarrowColumns';

type InvoicesTFunction = TFunction<'invoices'>;

export function createInvoiceLineActionsColumn(
  t: InvoicesTFunction,
  renderExtraItems?: (line: InvoiceLine) => ReactNode,
): MRT_ColumnDef<InvoiceLine> {
  return {
    id: 'actions',
    header: '',
    ...mrtFixedSizeColumnProps(MRT_NARROW_ACTIONS_SIZE),
    Cell: ({ row }) => (
      <LineRowActionsMenu
        lineageId={row.original.lineageId}
        moreLabel={t('actions.more')}
        openTraceLabel={t('actions.openTrace')}
      >
        {renderExtraItems?.(row.original)}
      </LineRowActionsMenu>
    ),
  };
}

export function createInvoiceLineBaseColumns(
  t: InvoicesTFunction,
  options?: {
    currency: string;
    totalAmount?: string;
    renderActionExtraItems?: (line: InvoiceLine) => ReactNode;
  },
): MRT_ColumnDef<InvoiceLine>[] {
  const currency = options?.currency ?? '';
  const totalAmount = options?.totalAmount;

  return [
    createInvoiceLineActionsColumn(t, options?.renderActionExtraItems),
    {
      id: 'lineNumber',
      accessorKey: 'lineNumber',
      header: t('columns.lineNumber'),
      ...mrtFixedSizeColumnProps(MRT_NARROW_LINE_NUMBER_SIZE),
    },
    {
      id: 'requestLine',
      header: t('columns.requestLine'),
      grow: true,
      Cell: ({ row }) => (
        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
          <span>{row.original.requestLine?.description ?? '—'}</span>
          <RequestLineCancelledBadge
            cancelledAt={row.original.requestLine?.cancelledAt}
          />
        </Stack>
      ),
    },
    {
      id: 'notes',
      accessorKey: 'notes',
      header: t('columns.notes'),
      size: 120,
      grow: false,
      Cell: ({ row }) => row.original.notes ?? '—',
    },
    {
      id: 'quantity',
      accessorKey: 'quantity',
      header: t('columns.quantity'),
      size: 120,
      grow: false,
      muiTableBodyCellProps: { align: 'right' },
      muiTableHeadCellProps: { align: 'right' },
      Cell: ({ row }) => (
        <DecimalDisplay
          value={row.original.quantity}
          suffix={row.original.requestLine?.unit ?? ''}
        />
      ),
    },
    {
      id: 'unitPrice',
      accessorKey: 'unitPrice',
      header: t('columns.unitPrice'),
      size: 120,
      grow: false,
      muiTableBodyCellProps: { align: 'right' },
      muiTableHeadCellProps: { align: 'right' },
      muiTableFooterCellProps: { align: 'right' },
      Cell: ({ row }) => (
        <DecimalDisplay value={row.original.unitPrice} suffix={currency} groupDigits />
      ),
    },
    {
      id: 'lineTotal',
      accessorKey: 'lineTotal',
      header: t('columns.lineTotal'),
      size: 140,
      grow: false,
      muiTableBodyCellProps: { align: 'right' },
      muiTableHeadCellProps: { align: 'right' },
      muiTableFooterCellProps: { align: 'right' },
      Cell: ({ row }) => (
        <DecimalDisplay value={row.original.lineTotal} suffix={currency} groupDigits />
      ),
      Footer:
        totalAmount != null
          ? () => (
              <DecimalDisplay
                value={totalAmount}
                suffix={currency}
                groupDigits
                fontWeight={600}
              />
            )
          : undefined,
    },
  ];
}
