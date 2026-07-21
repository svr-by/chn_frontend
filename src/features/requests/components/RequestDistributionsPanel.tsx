import { useMemo, useState } from 'react';
import {
  Box,
  Button,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { useTranslation } from 'react-i18next';

import { useGetRequestDistributionsQuery } from '@/api/endpoints/requestsApi';
import { ApiErrorAlert } from '@/components/ApiErrorAlert';
import { DistributionStatusBadge } from '@/components/DistributionStatusBadge';
import {
  RequestDistributeDialog,
  type DistributePrefill,
} from '@/features/requests/components/RequestDistributeDialog';
import type { RequestLine } from '@/api/generated/models/requestLine';
import type { RequestDistribution } from '@/api/generated/models/requestDistribution';

interface RequestDistributionsPanelProps {
  companyId: string;
  requestId: string;
  requestLines: RequestLine[];
  requestStatus: string;
}

function toPrefill(distribution: RequestDistribution): DistributePrefill {
  return {
    supplierCompanyId: distribution.supplierCompany.id,
    requestLineIds: distribution.lines.map((line) => line.id),
  };
}

export function RequestDistributionsPanel({
  companyId,
  requestId,
  requestLines,
  requestStatus,
}: RequestDistributionsPanelProps) {
  const { t } = useTranslation('requests');
  const [resendOpen, setResendOpen] = useState(false);
  const [resendPrefill, setResendPrefill] = useState<DistributePrefill[]>([]);

  const showPanel = ['QUOTING', 'PARTIALLY_ORDERED', 'ORDERED'].includes(
    requestStatus,
  );

  const distributionsQuery = useGetRequestDistributionsQuery(
    { companyId, requestId },
    { skip: !companyId || !requestId || !showPanel },
  );

  const distributions = distributionsQuery.data?.distributions ?? [];

  const rejectedCount = useMemo(
    () => distributions.filter((item) => item.status === 'REJECTED').length,
    [distributions],
  );

  if (!showPanel) {
    return null;
  }

  function handleResend(distribution: RequestDistribution) {
    setResendPrefill([toPrefill(distribution)]);
    setResendOpen(true);
  }

  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        {t('distributions.title')}
        {rejectedCount > 0
          ? ` (${t('distributions.rejectedCount', { count: rejectedCount })})`
          : null}
      </Typography>

      <ApiErrorAlert error={distributionsQuery.error} />

      {distributionsQuery.isLoading ? (
        <Typography color="text.secondary">{t('distributions.loading')}</Typography>
      ) : distributions.length === 0 ? (
        <Typography color="text.secondary">{t('distributions.empty')}</Typography>
      ) : (
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>{t('distributions.columns.supplier')}</TableCell>
              <TableCell>{t('distributions.columns.status')}</TableCell>
              <TableCell>{t('distributions.columns.lines')}</TableCell>
              <TableCell>{t('distributions.columns.rejection')}</TableCell>
              <TableCell align="right">{t('columns.actions')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {distributions.map((distribution) => (
              <TableRow key={distribution.id}>
                <TableCell>{distribution.supplierCompany.name}</TableCell>
                <TableCell>
                  <DistributionStatusBadge status={distribution.status} />
                </TableCell>
                <TableCell>
                  <Stack spacing={0.5}>
                    {distribution.lines.map((line) => (
                      <Typography key={line.id} variant="body2">
                        {line.lineNumber}. {line.description}
                      </Typography>
                    ))}
                  </Stack>
                </TableCell>
                <TableCell>
                  {distribution.status === 'REJECTED' ? (
                    <Stack spacing={0.5}>
                      {distribution.rejectionReason ? (
                        <Typography variant="body2">
                          {distribution.rejectionReason}
                        </Typography>
                      ) : null}
                      {distribution.rejectedAt ? (
                        <Typography variant="caption" color="text.secondary">
                          {new Date(distribution.rejectedAt).toLocaleString()}
                        </Typography>
                      ) : null}
                      {distribution.rejectedBy?.displayName ? (
                        <Typography variant="caption" color="text.secondary">
                          {distribution.rejectedBy.displayName}
                        </Typography>
                      ) : null}
                    </Stack>
                  ) : (
                    '—'
                  )}
                </TableCell>
                <TableCell align="right">
                  {distribution.status === 'REJECTED' ? (
                    <Button size="small" onClick={() => handleResend(distribution)}>
                      {t('distributions.resend')}
                    </Button>
                  ) : null}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <RequestDistributeDialog
        open={resendOpen}
        companyId={companyId}
        requestId={requestId}
        requestLines={requestLines}
        initialDistributions={resendPrefill}
        onClose={() => {
          setResendOpen(false);
          setResendPrefill([]);
        }}
      />
    </Box>
  );
}
