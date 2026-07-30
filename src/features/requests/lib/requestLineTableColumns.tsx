import type { ReactNode } from 'react';
import type { MRT_ColumnDef } from 'material-react-table';
import type { TFunction } from 'i18next';

import type { RequestLine } from '@/api/generated/models/requestLine';
import { DecimalWithSuffix } from '@/components/DecimalWithSuffix';
import { LineRowActionsMenu } from '@/components/LineRowActionsMenu';
import {
  MRT_NARROW_ACTIONS_SIZE,
  MRT_NARROW_LINE_NUMBER_SIZE,
  mrtFixedSizeColumnProps,
} from '@/lib/mrtNarrowColumns';

type RequestsTFunction = TFunction<'requests'>;

export function createRequestLineActionsColumn(
  t: RequestsTFunction,
  renderExtraItems?: (line: RequestLine) => ReactNode,
): MRT_ColumnDef<RequestLine> {
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

export function createRequestLineNumberColumn(
  t: RequestsTFunction,
): MRT_ColumnDef<RequestLine> {
  return {
    id: 'lineNumber',
    accessorKey: 'lineNumber',
    header: t('columns.lineNumber'),
    ...mrtFixedSizeColumnProps(MRT_NARROW_LINE_NUMBER_SIZE),
  };
}

export function createRequestLineDescriptionColumn(
  t: RequestsTFunction,
): MRT_ColumnDef<RequestLine> {
  return {
    id: 'description',
    accessorKey: 'description',
    header: t('columns.description'),
    grow: true,
  };
}

export function createRequestLineQuantityColumn(
  t: RequestsTFunction,
): MRT_ColumnDef<RequestLine> {
  return {
    id: 'quantity',
    header: t('columns.quantity'),
    size: 120,
    grow: false,
    Cell: ({ row }) => (
      <DecimalWithSuffix
        value={row.original.quantity}
        suffix={row.original.unit ?? '—'}
      />
    ),
  };
}

export function createRequestLineBaseColumns(
  t: RequestsTFunction,
  options?: {
    renderActionExtraItems?: (line: RequestLine) => ReactNode;
  },
): MRT_ColumnDef<RequestLine>[] {
  return [
    createRequestLineActionsColumn(t, options?.renderActionExtraItems),
    createRequestLineNumberColumn(t),
    createRequestLineDescriptionColumn(t),
    createRequestLineQuantityColumn(t),
  ];
}
