import { Box, Chip, List, Stack, Typography } from '@mui/material';
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import PauseCircleOutlineIcon from '@mui/icons-material/PauseCircleOutline';
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';
import PublicOutlinedIcon from '@mui/icons-material/PublicOutlined';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import { useTranslation } from 'react-i18next';

import {
  CompanyCountryEditButton,
  CompanyNameEditButton,
  CompanyTaxIdEditButton,
} from '@/features/settings/components/companyProfileEditButtons/CompanyProfileEditButtons';
import { CompanyStatusPanel } from '@/features/settings/components/companyStatusPanel/CompanyStatusPanel';
import { ProfileInfoRow } from '@/features/settings/components/profileInfo/ProfileInfoRow';
import { ProfileInfoSection } from '@/features/settings/components/profileInfo/ProfileInfoSection';
import { ProfileNameEditButton } from '@/features/settings/components/profileNameEditButton/ProfileNameEditButton';
import { ProfileResendVerificationButton } from '@/features/settings/components/profileResendVerificationButton/ProfileResendVerificationButton';
import { formatMemberRole } from '@/features/settings/lib/memberDisplay';
import { usePermissions } from '@/hooks/usePermissions';
import { formatLocalizedDate } from '@/lib/dateFormat';
import { isCompanyOperational } from '@/lib/permissions';
import { PageShell } from '@/layouts/pageShell/PageShell';

export function ProfilePage() {
  const { t, i18n } = useTranslation(['profile', 'enums']);
  const { user, membership, hasPermission } = usePermissions();

  if (!user) {
    return null;
  }

  const displayName =
    [user.firstName, user.lastName].filter(Boolean).join(' ').trim() || '—';
  const company = membership?.company;
  const companyActive = company ? isCompanyOperational(company) : false;
  const canManageCompany = hasPermission('manageCompany');

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
          <ProfileInfoSection
            title={t('profile:sections.account')}
            hint={t('profile:sections.accountHint')}
          >
            <List disablePadding>
              <ProfileInfoRow
                icon={<PersonOutlinedIcon fontSize="small" color="action" />}
                label={t('profile:fields.name')}
                value={displayName}
                action={
                  <ProfileNameEditButton
                    firstName={user.firstName}
                    lastName={user.lastName}
                  />
                }
              />
              <ProfileInfoRow
                icon={<EmailOutlinedIcon fontSize="small" color="action" />}
                label={t('profile:fields.email')}
                value={
                  user.emailVerified ? (
                    user.email
                  ) : (
                    <Box>
                      <Typography
                        variant="body2"
                        color="text.primary"
                        sx={{ wordBreak: 'break-word' }}
                      >
                        {user.email}
                      </Typography>
                      <Typography
                        variant="caption"
                        color="warning.main"
                        sx={{ display: 'block', mt: 0.25 }}
                      >
                        {t('profile:emailNotVerified')}
                      </Typography>
                    </Box>
                  )
                }
                action={
                  !user.emailVerified ? (
                    <ProfileResendVerificationButton />
                  ) : undefined
                }
              />
            </List>
          </ProfileInfoSection>

          <ProfileInfoSection
            title={t('profile:sections.company')}
            hint={t('profile:sections.companyHint')}
          >
            {company && membership ? (
              <List disablePadding>
                <ProfileInfoRow
                  icon={
                    <BusinessOutlinedIcon fontSize="small" color="action" />
                  }
                  label={t('profile:fields.companyName')}
                  value={company.name}
                  action={
                    canManageCompany ? (
                      <CompanyNameEditButton
                        companyId={company.id}
                        name={company.name}
                      />
                    ) : undefined
                  }
                />
                <ProfileInfoRow
                  icon={<PublicOutlinedIcon fontSize="small" color="action" />}
                  label={t('profile:fields.country')}
                  value={company.country ?? '—'}
                  action={
                    canManageCompany ? (
                      <CompanyCountryEditButton
                        companyId={company.id}
                        country={company.country}
                      />
                    ) : undefined
                  }
                />
                <ProfileInfoRow
                  icon={<BadgeOutlinedIcon fontSize="small" color="action" />}
                  label={t('profile:fields.taxId')}
                  value={company.taxId ?? '—'}
                  action={
                    canManageCompany ? (
                      <CompanyTaxIdEditButton
                        companyId={company.id}
                        taxId={company.taxId}
                      />
                    ) : undefined
                  }
                />
                <ProfileInfoRow
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
                <ProfileInfoRow
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
                <ProfileInfoRow
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
          </ProfileInfoSection>
        </Box>

        <CompanyStatusPanel />
      </Stack>
    </PageShell>
  );
}
