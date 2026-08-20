import {
  Box,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import MarkEmailUnreadOutlinedIcon from '@mui/icons-material/MarkEmailUnreadOutlined';
import PauseCircleOutlineIcon from '@mui/icons-material/PauseCircleOutline';
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';
import PublicOutlinedIcon from '@mui/icons-material/PublicOutlined';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import { CompanyStatusPanel } from '@/features/settings/components/CompanyStatusPanel';
import { formatMemberRole } from '@/features/settings/lib/memberDisplay';
import { usePermissions } from '@/hooks/usePermissions';
import { formatLocalizedDate } from '@/lib/dateFormat';
import { isCompanyOperational } from '@/lib/permissions';
import { PageShell } from '@/layouts/pageShell/PageShell';

interface InfoRowProps {
  icon: ReactNode;
  label: string;
  value: ReactNode;
}

function InfoRow({ icon, label, value }: InfoRowProps) {
  return (
    <ListItem
      alignItems="flex-start"
      sx={{
        px: 0,
        py: { xs: 1, sm: 1.25 },
        '&:not(:last-of-type)': {
          borderBottom: 1,
          borderColor: 'divider',
        },
      }}
    >
      <ListItemIcon sx={{ minWidth: 36, mt: 0.35 }}>{icon}</ListItemIcon>
      <ListItemText
        sx={{ my: 0, minWidth: 0 }}
        primary={
          <Typography variant="caption" color="text.secondary" component="div">
            {label}
          </Typography>
        }
        secondary={
          typeof value === 'string' || typeof value === 'number' ? (
            <Typography
              variant="body2"
              color="text.primary"
              component="span"
              sx={{
                display: 'block',
                mt: 0.25,
                wordBreak: 'break-word',
              }}
            >
              {value}
            </Typography>
          ) : (
            <Box sx={{ mt: 0.5 }}>{value}</Box>
          )
        }
        slotProps={{
          primary: { component: 'div' },
          secondary: { component: 'div' },
        }}
      />
    </ListItem>
  );
}

interface InfoSectionProps {
  title: string;
  hint: string;
  children: ReactNode;
}

function InfoSection({ title, hint, children }: InfoSectionProps) {
  return (
    <Paper
      variant="outlined"
      sx={{
        p: { xs: 2, sm: 2.5 },
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        minWidth: 0,
      }}
    >
      <Typography variant="subtitle1" component="h2">
        {title}
      </Typography>
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ mt: 0.5, mb: 1.5 }}
      >
        {hint}
      </Typography>
      <Box sx={{ flex: 1, minWidth: 0 }}>{children}</Box>
    </Paper>
  );
}

export function ProfilePage() {
  const { t, i18n } = useTranslation(['profile', 'enums']);
  const { user, membership } = usePermissions();

  if (!user) {
    return null;
  }

  const displayName =
    [user.firstName, user.lastName].filter(Boolean).join(' ').trim() || '—';
  const company = membership?.company;
  const companyActive = company ? isCompanyOperational(company) : false;

  return (
    <PageShell maxWidth="lg">
      <Stack spacing={{ xs: 2.5, sm: 3 }}>
        <Box>
          <Typography variant="h5" component="h1">
            {t('profile:title')}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {t('profile:subtitle')}
          </Typography>
        </Box>

        <Box
          sx={{
            display: 'grid',
            gap: { xs: 2, sm: 2.5 },
            gridTemplateColumns: {
              xs: '1fr',
              md: 'minmax(0, 1fr) minmax(0, 1fr)',
            },
            alignItems: 'stretch',
          }}
        >
          <InfoSection
            title={t('profile:sections.account')}
            hint={t('profile:sections.accountHint')}
          >
            <List disablePadding>
              <InfoRow
                icon={<PersonOutlinedIcon fontSize="small" color="action" />}
                label={t('profile:fields.name')}
                value={displayName}
              />
              <InfoRow
                icon={<EmailOutlinedIcon fontSize="small" color="action" />}
                label={t('profile:fields.email')}
                value={user.email}
              />
              <InfoRow
                icon={
                  user.emailVerified ? (
                    <CheckCircleOutlineIcon fontSize="small" color="success" />
                  ) : (
                    <MarkEmailUnreadOutlinedIcon
                      fontSize="small"
                      color="warning"
                    />
                  )
                }
                label={t('profile:fields.emailStatus')}
                value={
                  <Chip
                    size="small"
                    color={user.emailVerified ? 'success' : 'warning'}
                    variant="outlined"
                    label={
                      user.emailVerified
                        ? t('profile:emailVerified')
                        : t('profile:emailNotVerified')
                    }
                  />
                }
              />
            </List>
          </InfoSection>

          <InfoSection
            title={t('profile:sections.company')}
            hint={t('profile:sections.companyHint')}
          >
            {company && membership ? (
              <List disablePadding>
                <InfoRow
                  icon={
                    <BusinessOutlinedIcon fontSize="small" color="action" />
                  }
                  label={t('profile:fields.companyName')}
                  value={company.name}
                />
                <InfoRow
                  icon={<PublicOutlinedIcon fontSize="small" color="action" />}
                  label={t('profile:fields.country')}
                  value={company.country ?? '—'}
                />
                <InfoRow
                  icon={<BadgeOutlinedIcon fontSize="small" color="action" />}
                  label={t('profile:fields.taxId')}
                  value={company.taxId ?? '—'}
                />
                <InfoRow
                  icon={<ShieldOutlinedIcon fontSize="small" color="action" />}
                  label={t('profile:fields.role')}
                  value={
                    <Chip
                      size="small"
                      color={
                        membership.role === 'OWNER' ? 'primary' : 'default'
                      }
                      variant={
                        membership.role === 'OWNER' ? 'filled' : 'outlined'
                      }
                      label={formatMemberRole(t, membership.role)}
                    />
                  }
                />
                <InfoRow
                  icon={
                    companyActive ? (
                      <CheckCircleOutlineIcon
                        fontSize="small"
                        color="success"
                      />
                    ) : (
                      <PauseCircleOutlineIcon
                        fontSize="small"
                        color="warning"
                      />
                    )
                  }
                  label={t('profile:fields.companyStatus')}
                  value={
                    <Chip
                      size="small"
                      color={companyActive ? 'success' : 'warning'}
                      variant="outlined"
                      label={
                        companyActive
                          ? t('profile:companyActive')
                          : t('profile:companyInactive')
                      }
                    />
                  }
                />
                <InfoRow
                  icon={
                    <CalendarMonthOutlinedIcon
                      fontSize="small"
                      color="action"
                    />
                  }
                  label={t('profile:fields.joinedAt')}
                  value={formatLocalizedDate(membership.joinedAt, i18n.language)}
                />
              </List>
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ py: 1 }}>
                {t('profile:noActiveCompany')}
              </Typography>
            )}
          </InfoSection>
        </Box>

        <CompanyStatusPanel />
      </Stack>
    </PageShell>
  );
}
