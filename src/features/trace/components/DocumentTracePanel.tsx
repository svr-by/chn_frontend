import { Link as RouterLink } from 'react-router-dom';
import {
  Button,
  Link,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { useTranslation } from 'react-i18next';

import { DecimalDisplay } from '@/components/DecimalDisplay';
import { LineageLink } from '@/components/LineageLink';

export interface LineageEntry {
  lineageId: string;
  description: string;
  quantity: string;
  unit?: string | null;
}

interface DocumentTracePanelProps {
  lineageEntries?: LineageEntry[];
  paymentInvoiceId?: string;
  requestId?: string;
}

export function DocumentTracePanel({
  lineageEntries = [],
  paymentInvoiceId,
  requestId,
}: DocumentTracePanelProps) {
  const { t } = useTranslation('trace');

  if (paymentInvoiceId) {
    return (
      <Stack spacing={2}>
        <Typography variant="body2" color="text.secondary">
          {t('documentTrace.paymentHint')}
        </Typography>
        <Link
          component={RouterLink}
          to={`/app/invoices/${paymentInvoiceId}`}
          underline="hover"
        >
          {t('documentTrace.openInvoice', {
            id: paymentInvoiceId.slice(0, 8),
          })}
        </Link>
      </Stack>
    );
  }

  if (lineageEntries.length === 0) {
    return (
      <Stack spacing={2}>
        <Typography variant="body2" color="text.secondary">
          {t('documentTrace.empty')}
        </Typography>
        {requestId ? (
          <Button
            component={RouterLink}
            variant="outlined"
            to={`/app/trace?requestId=${requestId}`}
          >
            {t('documentTrace.searchByRequest')}
          </Button>
        ) : null}
      </Stack>
    );
  }

  return (
    <Stack spacing={2}>
      {requestId ? (
        <Button
          component={RouterLink}
          variant="outlined"
          size="small"
          sx={{ alignSelf: 'flex-start' }}
          to={`/app/trace?requestId=${requestId}`}
        >
          {t('documentTrace.searchByRequest')}
        </Button>
      ) : null}

      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>{t('columns.description')}</TableCell>
              <TableCell>{t('columns.quantity')}</TableCell>
              <TableCell>{t('columns.lineageId')}</TableCell>
              <TableCell align="right">{t('documentTrace.actions')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {lineageEntries.map((entry) => (
              <TableRow key={entry.lineageId}>
                <TableCell>{entry.description}</TableCell>
                <TableCell>
                  <DecimalDisplay value={entry.quantity} component="span" />
                  {entry.unit ? ` ${entry.unit}` : ''}
                </TableCell>
                <TableCell>
                  <LineageLink lineageId={entry.lineageId} />
                </TableCell>
                <TableCell align="right">
                  <Button
                    component={RouterLink}
                    size="small"
                    to={`/app/trace/${entry.lineageId}`}
                  >
                    {t('documentTrace.viewFull')}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Stack>
  );
}
