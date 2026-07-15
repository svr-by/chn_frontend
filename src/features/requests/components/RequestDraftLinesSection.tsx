import { useMemo, useState } from 'react';
import {
  Button,
  IconButton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import { useTranslation } from 'react-i18next';

import { DecimalDisplay } from '@/components/DecimalDisplay';
import { RequestLineFormDialog } from '@/features/requests/components/RequestLineFormDialog';
import {
  createEmptyDraftLine,
  updateDraftLine,
  type DraftRequestLine,
  type RequestLineFormValues,
} from '@/features/requests/types/draftRequestLine';

interface RequestDraftLinesSectionProps {
  companyId: string;
  lines: DraftRequestLine[];
  onChange: (lines: DraftRequestLine[]) => void;
  onImportClick: () => void;
  errorMessage?: string;
}

export function RequestDraftLinesSection({
  companyId,
  lines,
  onChange,
  onImportClick,
  errorMessage,
}: RequestDraftLinesSectionProps) {
  const { t } = useTranslation('requests');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingLine, setEditingLine] = useState<DraftRequestLine | null>(null);

  const numberedLines = useMemo(
    () => lines.map((line, index) => ({ line, lineNumber: index + 1 })),
    [lines],
  );

  function handleLocalSubmit(values: RequestLineFormValues) {
    if (editingLine) {
      onChange(
        lines.map((line) =>
          line.clientId === editingLine.clientId
            ? updateDraftLine(line, values)
            : line,
        ),
      );
    } else {
      onChange([...lines, createEmptyDraftLine(values)]);
    }
  }

  function openAddDialog() {
    setEditingLine(null);
    setDialogOpen(true);
  }

  return (
    <Stack spacing={2} sx={{ width: '100%', mb: 3 }}>
      {errorMessage ? (
        <Typography color="error" variant="body2">
          {errorMessage}
        </Typography>
      ) : null}

      {<Table size="small" sx={{ border: 1, borderColor: 'divider' }}>
          <TableHead>
            <TableRow>
              <TableCell width={48}>{t('columns.lineNumber')}</TableCell>
              <TableCell>{t('columns.description')}</TableCell>
              <TableCell>{t('columns.quantity')}</TableCell>
              <TableCell>{t('columns.unit')}</TableCell>
              <TableCell>{t('columns.notes')}</TableCell>
              <TableCell align="right">{t('columns.actions')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {numberedLines.map(({ line, lineNumber }) => (
              <TableRow key={line.clientId}>
                <TableCell>{lineNumber}</TableCell>
                <TableCell>{line.description}</TableCell>
                <TableCell>
                  <DecimalDisplay value={line.quantity} />
                </TableCell>
                <TableCell>{line.unit ?? '—'}</TableCell>
                <TableCell>{line.notes ?? '—'}</TableCell>
                <TableCell align="right">
                  <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                    <Tooltip title={t('actions.editLine')}>
                      <IconButton
                        size="small"
                        aria-label={t('actions.editLine')}
                        onClick={() => {
                          setEditingLine(line);
                          setDialogOpen(true);
                        }}
                      >
                        <EditOutlinedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title={t('actions.deleteLine')}>
                      <IconButton
                        size="small"
                        color="error"
                        aria-label={t('actions.deleteLine')}
                        onClick={() =>
                          onChange(
                            lines.filter(
                              (item) => item.clientId !== line.clientId,
                            ),
                          )
                        }
                      >
                        <DeleteOutlineIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      }

      <Stack direction="row" spacing={1}>
        <Button variant="outlined" onClick={openAddDialog}>
          {t('actions.addLine')}
        </Button>
        <Button variant="outlined" onClick={onImportClick}>
          {t('actions.importFromFile')}
        </Button>
      </Stack>

      <RequestLineFormDialog
        mode="local"
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setEditingLine(null);
        }}
        companyId={companyId}
        draftLine={editingLine}
        onLocalSubmit={handleLocalSubmit}
      />
    </Stack>
  );
}
