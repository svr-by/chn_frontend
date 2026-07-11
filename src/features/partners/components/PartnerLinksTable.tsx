import {
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

import type { TradingPartner } from '@/api/generated/models/tradingPartner';
import { PartnerStatusBadge } from '@/components/PartnerStatusBadge';
import { PermissionGate } from '@/components/PermissionGate';

interface PartnerLinksTableProps {
  partners: TradingPartner[];
  variant: 'inbound' | 'outbound';
  emptyMessage: string;
  onAccept?: (linkId: string) => void;
  onReject?: (linkId: string) => void;
  actionsDisabled?: boolean;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString();
}

export function PartnerLinksTable({
  partners,
  variant,
  emptyMessage,
  onAccept,
  onReject,
  actionsDisabled = false,
}: PartnerLinksTableProps) {
  const { t } = useTranslation('partners');

  if (partners.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary" sx={{ py: 3 }}>
        {emptyMessage}
      </Typography>
    );
  }

  const showActions = variant === 'inbound';

  return (
    <Table size="small">
      <TableHead>
        <TableRow>
          <TableCell>{t('columns.name')}</TableCell>
          <TableCell>{t('columns.taxId')}</TableCell>
          <TableCell>{t('columns.country')}</TableCell>
          <TableCell>{t('columns.status')}</TableCell>
          <TableCell>{t('columns.invitedAt')}</TableCell>
          {showActions && (
            <TableCell align="right">{t('columns.actions')}</TableCell>
          )}
        </TableRow>
      </TableHead>
      <TableBody>
        {partners.map((partner) => (
          <TableRow key={partner.id}>
            <TableCell>{partner.company.name}</TableCell>
            <TableCell>{partner.company.taxId ?? '—'}</TableCell>
            <TableCell>{partner.company.country ?? '—'}</TableCell>
            <TableCell>
              <PartnerStatusBadge status={partner.status} />
            </TableCell>
            <TableCell>{formatDate(partner.invitedAt)}</TableCell>
            {showActions && (
              <TableCell align="right">
                {partner.status === 'INVITED' && (
                  <PermissionGate permission="managePartners">
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                      <Button
                        size="small"
                        variant="contained"
                        disabled={actionsDisabled}
                        onClick={() => onAccept?.(partner.id)}
                      >
                        {t('actions.accept')}
                      </Button>
                      <Button
                        size="small"
                        disabled={actionsDisabled}
                        onClick={() => onReject?.(partner.id)}
                      >
                        {t('actions.reject')}
                      </Button>
                    </Stack>
                  </PermissionGate>
                )}
              </TableCell>
            )}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
