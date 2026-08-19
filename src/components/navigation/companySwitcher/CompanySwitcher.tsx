import { useMemo } from 'react';
import {
  Alert,
  FormControl,
  InputLabel,
  ListSubheader,
  MenuItem,
  Select,
  Typography,
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';
import { useTranslation } from 'react-i18next';

import { useGetMeQuery } from '@/api/endpoints/authApi';
import { useAppDispatch } from '@/hooks/useAppDispatch';
import { useAppSelector } from '@/hooks/useAppSelector';
import { authStorage } from '@/lib/authStorage';
import {
  getSwitcherMemberships,
  isCompanyOperational,
} from '@/lib/permissions';
import { setActiveCompanyId } from '@/store/slices/authSlice';
import { baseApi } from '@/api/baseApi';

type CompanySwitcherProps = {
  /** White text/icons for use on dark AppBar backgrounds. */
  onDark?: boolean;
};

export function CompanySwitcher({ onDark = false }: CompanySwitcherProps) {
  const { t } = useTranslation('common');
  const dispatch = useAppDispatch();
  const activeCompanyId = useAppSelector((state) => state.auth.activeCompanyId);
  const hasRefreshToken = Boolean(authStorage.getRefreshToken());
  const { data } = useGetMeQuery(undefined, { skip: !hasRefreshToken });

  const switcherMemberships = useMemo(
    () => getSwitcherMemberships(data?.user),
    [data?.user],
  );

  const operationalMemberships = useMemo(
    () =>
      switcherMemberships.filter((membership) =>
        isCompanyOperational(membership.company),
      ),
    [switcherMemberships],
  );

  const inactiveOwnerMemberships = useMemo(
    () =>
      switcherMemberships.filter(
        (membership) =>
          membership.role === 'OWNER' &&
          !isCompanyOperational(membership.company),
      ),
    [switcherMemberships],
  );

  const activeMembership = switcherMemberships.find(
    (membership) => membership.company?.id === activeCompanyId,
  );
  const isActiveCompanyInactive =
    activeMembership != null && !isCompanyOperational(activeMembership.company);

  if (switcherMemberships.length === 0) {
    return null;
  }

  function handleChange(event: SelectChangeEvent<string>) {
    const companyId = event.target.value;
    dispatch(setActiveCompanyId(companyId));
    dispatch(baseApi.util.invalidateTags(['Company']));
  }

  const selectDisabled = switcherMemberships.length <= 1;
  const companyName = activeMembership?.company?.name;

  return (
    <>
      {selectDisabled ? (
        <Typography
          variant="body2"
          noWrap
          sx={{
            minWidth: 180,
            ...(onDark && { color: '#fff' }),
          }}
        >
          {companyName}
        </Typography>
      ) : (
        <FormControl
          size="small"
          sx={{
            minWidth: 200,
            ...(onDark && { color: '#fff' }),
          }}
        >
          <InputLabel
            id="company-switcher-label"
            sx={onDark ? { color: 'inherit' } : undefined}
          >
            {t('app.company')}
          </InputLabel>
          <Select
            labelId="company-switcher-label"
            value={activeCompanyId ?? ''}
            label={t('app.company')}
            onChange={handleChange}
            sx={
              onDark
                ? {
                    color: 'inherit',
                    '.MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(255, 255, 255, 0.5)',
                    },
                    '.MuiSelect-icon': { color: 'inherit' },
                  }
                : undefined
            }
          >
            {operationalMemberships.map((membership) => (
              <MenuItem
                key={membership.company?.id}
                value={membership.company?.id ?? ''}
              >
                {membership.company?.name}
              </MenuItem>
            ))}
            {inactiveOwnerMemberships.length > 0 && [
              <ListSubheader key="inactive-header">
                {t('app.inactiveCompanies')}
              </ListSubheader>,
              ...inactiveOwnerMemberships.map((membership) => (
                <MenuItem
                  key={membership.company?.id}
                  value={membership.company?.id ?? ''}
                >
                  {membership.company?.name}
                </MenuItem>
              )),
            ]}
          </Select>
        </FormControl>
      )}
      {isActiveCompanyInactive ? (
        <Alert severity="warning" sx={{ mx: 1, py: 0 }}>
          {t('app.companyDeactivated')}
        </Alert>
      ) : null}
    </>
  );
}
