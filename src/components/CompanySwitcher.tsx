import { useMemo } from 'react';
import { FormControl, InputLabel, MenuItem, Select } from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';
import { useTranslation } from 'react-i18next';

import { useGetMeQuery } from '@/api/endpoints/authApi';
import { useAppDispatch } from '@/hooks/useAppDispatch';
import { useAppSelector } from '@/hooks/useAppSelector';
import { authStorage } from '@/lib/authStorage';
import { getActiveMemberships } from '@/lib/permissions';
import { setActiveCompanyId } from '@/store/slices/authSlice';
import { baseApi } from '@/api/baseApi';

export function CompanySwitcher() {
  const { t } = useTranslation('common');
  const dispatch = useAppDispatch();
  const activeCompanyId = useAppSelector((state) => state.auth.activeCompanyId);
  const hasRefreshToken = Boolean(authStorage.getRefreshToken());
  const { data } = useGetMeQuery(undefined, { skip: !hasRefreshToken });

  const activeMemberships = useMemo(
    () => getActiveMemberships(data?.user),
    [data?.user],
  );

  if (activeMemberships.length <= 1) {
    const companyName = activeMemberships[0]?.company?.name;
    if (!companyName) {
      return null;
    }

    return (
      <FormControl size="small" sx={{ minWidth: 180 }}>
        <Select
          labelId="company-switcher-label"
          value={activeCompanyId ?? ''}
          label={t('app.company')}
          variant="standard"
          disabled
        >
          <MenuItem value={activeCompanyId ?? ''}>{companyName}</MenuItem>
        </Select>
      </FormControl>
    );
  }

  function handleChange(event: SelectChangeEvent<string>) {
    const companyId = event.target.value;
    dispatch(setActiveCompanyId(companyId));
    dispatch(baseApi.util.invalidateTags(['Company']));
  }

  return (
    <FormControl size="small" sx={{ minWidth: 200 }}>
      <InputLabel id="company-switcher-label">{t('app.company')}</InputLabel>
      <Select
        labelId="company-switcher-label"
        value={activeCompanyId ?? ''}
        label={t('app.company')}
        onChange={handleChange}
      >
        {activeMemberships.map((membership) => (
          <MenuItem
            key={membership.company?.id}
            value={membership.company?.id ?? ''}
          >
            {membership.company?.name}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
