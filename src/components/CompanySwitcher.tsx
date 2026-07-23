import { useMemo } from 'react';
import {
  Alert,
  FormControl,
  InputLabel,
  ListSubheader,
  MenuItem,
  Select,
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

export function CompanySwitcher() {
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

  return (
    <>
      <FormControl size="small" sx={{ minWidth: selectDisabled ? 180 : 200 }}>
        {!selectDisabled && (
          <InputLabel id="company-switcher-label">
            {t('app.company')}
          </InputLabel>
        )}
        <Select
          labelId="company-switcher-label"
          value={activeCompanyId ?? ''}
          label={selectDisabled ? undefined : t('app.company')}
          variant={selectDisabled ? 'standard' : 'outlined'}
          disabled={selectDisabled}
          onChange={handleChange}
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
      {isActiveCompanyInactive ? (
        <Alert severity="warning" sx={{ mx: 1, py: 0 }}>
          {t('app.companyDeactivated')}
        </Alert>
      ) : null}
    </>
  );
}
