import type { MRT_ColumnDef } from 'material-react-table';
import type { TFunction } from 'i18next';
import NotesOutlinedIcon from '@mui/icons-material/NotesOutlined';

import { ClampedTextDialog } from '@/components/dataDisplay/clampedTextDialog/ClampedTextDialog';
import { DecimalDisplay } from '@/components/dataDisplay/decimalDisplay/DecimalDisplay';
import { LineRowActionsMenu } from '@/components/actions/lineRowActionsMenu/LineRowActionsMenu';
import {
  RequestLineDescriptionCell,
  type RequestLineSkuSource,
} from '@/features/requests/lib/requestLineDescription';
import {
  MRT_NARROW_ACTIONS_SIZE,
  mrtFixedSizeColumnProps,
} from '@/lib/mrtNarrowColumns';

type RequestsTFunction = TFunction<'requests'>;

export interface RequestLineListRowBase extends RequestLineSkuSource {
  lineageId: string;
  lineNumber: number;
  quantity: string;
  unit?: string | null;
  notes?: string | null;
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
    Cell: ({ row }) => <RequestLineDescriptionCell line={row.original} />,
  };
}

export function createRequestLineListNotesColumn<
  T extends RequestLineListRowBase,
>(t: RequestsTFunction): MRT_ColumnDef<T> {
  return {
    id: 'notes',
    accessorKey: 'notes',
    header: t('columns.notes'),
    size: 220,
    grow: false,
    enableColumnFilter: false,
    Cell: ({ row }) => (
      <ClampedTextDialog
        text={row.original.notes}
        title={t('form.notes')}
        closeLabel={t('actions.cancel')}
        previewLines={1}
        icon={
          <NotesOutlinedIcon
            fontSize="small"
            color="action"
            sx={{ mt: 0.5, flex: '0 0 auto' }}
          />
        }
      />
    ),
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
    createRequestLineListNotesColumn(t),
    createRequestLineListQuantityColumn(t),
  ];
}
