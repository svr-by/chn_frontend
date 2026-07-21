import { useMemo, useState } from 'react';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Chip,
  Stack,
  Typography,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  MaterialReactTable,
  type MRT_ColumnDef,
} from 'material-react-table';
import { useTranslation } from 'react-i18next';

import { useAppMaterialReactTable } from '@/hooks/useAppMaterialReactTable';
import type { PostCompaniesCompanyIdImportsRequestLinesCsvPreview200 } from '@/api/generated/models/postCompaniesCompanyIdImportsRequestLinesCsvPreview200';
import type { PostCompaniesCompanyIdImportsRequestLinesCsvPreview200PreviewRowsItem } from '@/api/generated/models/postCompaniesCompanyIdImportsRequestLinesCsvPreview200PreviewRowsItem';

type ImportPreviewData = PostCompaniesCompanyIdImportsRequestLinesCsvPreview200;

interface ImportPreviewTableProps {
  preview: ImportPreviewData;
}

export function ImportPreviewTable({ preview }: ImportPreviewTableProps) {
  const { t } = useTranslation('imports');
  const [mappingExpanded, setMappingExpanded] = useState(false);

  const rows = preview.preview.rows;

  const columns = useMemo<
    MRT_ColumnDef<PostCompaniesCompanyIdImportsRequestLinesCsvPreview200PreviewRowsItem>[]
  >(
    () => [
      {
        accessorKey: 'rowNumber',
        header: t('preview.columns.rowNumber'),
        size: 70,
      },
      {
        id: 'description',
        header: t('preview.columns.description'),
        accessorFn: (row) => row.parsed?.description ?? '—',
      },
      {
        id: 'quantity',
        header: t('preview.columns.quantity'),
        accessorFn: (row) => row.parsed?.quantity ?? '—',
      },
      {
        id: 'unit',
        header: t('preview.columns.unit'),
        accessorFn: (row) => row.parsed?.unit ?? '—',
      },
      {
        id: 'sku',
        header: t('preview.columns.sku'),
        accessorFn: (row) => row.parsed?.sku ?? '—',
      },
      {
        id: 'notes',
        header: t('preview.columns.notes'),
        accessorFn: (row) => row.parsed?.notes ?? '—',
      },
      {
        id: 'errors',
        header: t('preview.columns.errors'),
        Cell: ({ row }) => {
          const errors = row.original.errors;
          if (errors.length === 0) {
            return (
              <Chip label={t('preview.valid')} color="success" size="small" />
            );
          }
          return (
            <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
              {errors.map((error) => (
                <Chip key={error} label={error} color="error" size="small" />
              ))}
            </Stack>
          );
        },
      },
    ],
    [t],
  );

  const table = useAppMaterialReactTable({
    columns,
    data: rows,
    enableBottomToolbar: rows.length > 10,
    getRowId: (row) => String(row.rowNumber),
    muiTableBodyRowProps: ({ row }) => ({
      sx: (theme) => ({
        bgcolor:
          row.original.errors.length > 0
            ? theme.palette.mode === 'dark'
              ? 'rgba(211, 47, 47, 0.12)'
              : 'rgba(211, 47, 47, 0.08)'
            : 'inherit',
      }),
    }),
  });

  const mappingEntries = Object.entries(preview.columnMapping);

  return (
    <Stack spacing={2}>
      <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
        <Typography variant="body2" color="text.secondary">
          {t('preview.summary.valid', {
            count: preview.preview.validRowCount,
          })}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {t('preview.summary.invalid', {
            count: preview.preview.invalidRowCount,
          })}
        </Typography>
      </Stack>

      {mappingEntries.length > 0 ? (
        <Accordion
          expanded={mappingExpanded}
          onChange={(_event, expanded) => setMappingExpanded(expanded)}
          disableGutters
          elevation={0}
          sx={{ border: 1, borderColor: 'divider', '&:before': { display: 'none' } }}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="body2">{t('preview.columnMapping')}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Stack spacing={0.5}>
              {mappingEntries.map(([field, column]) => (
                <Typography key={field} variant="body2">
                  {t('preview.mappingEntry', { field, column })}
                </Typography>
              ))}
            </Stack>
          </AccordionDetails>
        </Accordion>
      ) : null}

      <Box>
        <MaterialReactTable table={table} />
      </Box>
    </Stack>
  );
}
