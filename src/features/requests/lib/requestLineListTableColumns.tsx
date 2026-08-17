import { Stack, Typography } from '@mui/material';
import type { MRT_ColumnDef } from 'material-react-table';
import type { TFunction } from 'i18next';

import { DecimalDisplay } from '@/components/DecimalDisplay';
import { LineRowActionsMenu } from '@/components/LineRowActionsMenu';
import {
  MRT_NARROW_ACTIONS_SIZE,
  MRT_NARROW_LINE_NUMBER_SIZE,
  mrtFixedSizeColumnProps,
} from '@/lib/mrtNarrowColumns';

type RequestsTFunction = TFunction<'requests'>;

export interface RequestLineListRowBase {
  lineageId: string;
  lineNumber: number;
  description: string;
  quantity: string;
  unit?: string | null;
  attributes?: { importSku?: unknown } | null;
  product?: { sku?: string | null } | null;
}

export function getRequestLineListImportSku(line: RequestLineListRowBase) {
  const value = line.attributes?.importSku;
  return typeof value === 'string' && value.trim() ? value : null;
}

export function createRequestLineListActionsColumn<T extends RequestLineListRowBase>(
  t: RequestsTFunction,
): MRT_ColumnDef<T> {
  return {
    id: 'actions',
    header: '',
    ...mrtFixedSizeColumnProps(MRT_NARROW_ACTIONS_SIZE),
    Cell: ({ row }) => (
      <LineRowActionsMenu
        lineageId={row.original.lineageId}
        moreLabel={t('actions.more')}
        openTraceLabel={t('actions.openTrace')}
      />
    ),
  };
}

export function createRequestLineListDescriptionColumn<
  T extends RequestLineListRowBase,
>(t: RequestsTFunction): MRT_ColumnDef<T> {
  return {
    id: 'description',
    accessorKey: 'description',
    header: t('requestLines.columns.description'),
    grow: true,
    enableColumnFilter: false,
    Cell: ({ row }) => {
      const sku =
        row.original.product?.sku ?? getRequestLineListImportSku(row.original);

      return (
        <Stack spacing={0.5}>
          <Typography variant="body2">{row.original.description}</Typography>
          {sku ? (
            <Typography variant="caption" color="text.secondary">
              {sku}
            </Typography>
          ) : null}
        </Stack>
      );
    },
  };
}

export function createRequestLineListQuantityColumn<
  T extends RequestLineListRowBase,
>(t: RequestsTFunction): MRT_ColumnDef<T> {
  return {
    id: 'quantity',
    header: t('requestLines.columns.quantity'),
    size: 120,
    grow: false,
    enableColumnFilter: false,
    muiTableBodyCellProps: {
      align: 'right',
    },
    muiTableHeadCellProps: {
      align: 'right',
    },
    Cell: ({ row }) => (
      <DecimalDisplay
        value={row.original.quantity}
        suffix={row.original.unit ?? ''}
      />
    ),
  };
}

export function createRequestLineListBaseColumns<T extends RequestLineListRowBase>(
  t: RequestsTFunction,
): MRT_ColumnDef<T>[] {
  return [
    createRequestLineListActionsColumn(t),
    createRequestLineListDescriptionColumn(t),
    createRequestLineListQuantityColumn(t),
  ];
}
