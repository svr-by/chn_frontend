import { Paper, Stack, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

import type { GetCompaniesCompanyIdQuotesDirection } from '@/api/generated/models/getCompaniesCompanyIdQuotesDirection';
import type { SupplierQuoteSummary } from '@/api/generated/models/supplierQuoteSummary';
import { DecimalDisplay } from '@/components/DecimalDisplay';
import { QuoteStatusBadge } from '@/components/QuoteStatusBadge';

interface QuoteCardProps {
  quote: SupplierQuoteSummary;
  direction: GetCompaniesCompanyIdQuotesDirection;
  onClick: () => void;
}

function formatDateTime(value: string | null | undefined): string {
  if (!value) return '—';
  return new Date(value).toLocaleDateString();
}

export function QuoteCard({ quote, direction, onClick }: QuoteCardProps) {
  const { t } = useTranslation('quotes');
  const isBuyerView = direction === 'outbound';

  const counterpartyName = isBuyerView
    ? quote.buyerCompany?.name ?? '—'
    : quote.supplierCompany?.name ?? '—';

  const createdAtText = formatDateTime(quote.createdAt);
  const validUntilText = formatDateTime(quote.validUntil);
  const createdByName = quote.createdByUser?.name ?? '—';

  return (
    <Paper
      component="button"
      type="button"
      variant="outlined"
      onClick={onClick}
      sx={{
        width: '100%',
        textAlign: 'left',
        cursor: 'pointer',
        p: 2,
        borderRadius: 1,
        bgcolor: 'background.paper',
        borderColor: 'divider',
        transition: (theme) =>
          theme.transitions.create(['border-color', 'background-color'], {
            duration: theme.transitions.duration.shorter,
          }),
        '&:hover': {
          borderColor: 'primary.main',
          bgcolor: 'action.hover',
        },
        '&:focus-visible': {
          outline: (theme) => `2px solid ${theme.palette.primary.main}`,
          outlineOffset: 2,
        },
      }}
    >
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={1.5}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', sm: 'center' }}
      >
        <Stack spacing={0.5} sx={{ minWidth: 0, flex: 1 }}>
          <Typography variant="subtitle1" fontWeight={600} noWrap>
            {counterpartyName}
          </Typography>

          <Typography variant="body2" color="text.secondary" noWrap>
            {t('columns.createdBy')}: {createdByName}
          </Typography>

          <Typography variant="body2" color="text.secondary" noWrap>
            {`${t('columns.positionsTotal')}: ${quote.positionsTotal} ${quote.currency} · ${t('columns.linesCount')}: ${quote.linesCount}`}
          </Typography>

          <Typography variant="body2" color="text.secondary">
            {t('columns.createdAt')}: {createdAtText}
            {' / '}
            {t('columns.validUntil')}: {validUntilText}
          </Typography>
        </Stack>

        <QuoteStatusBadge status={quote.status} />
      </Stack>
    </Paper>
  );
}
