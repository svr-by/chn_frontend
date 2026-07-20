import { useMemo } from 'react';
import {
  Autocomplete,
  Checkbox,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
} from '@mui/material';
import { useTranslation } from 'react-i18next';

import type { CompanyMember } from '@/api/generated/models/companyMember';
import { GetCompaniesCompanyIdRequestLinesStatus } from '@/api/generated/models/getCompaniesCompanyIdRequestLinesStatus';
import type { GetCompaniesCompanyIdRequestLinesStatus as RequestLineStatusFilter } from '@/api/generated/models/getCompaniesCompanyIdRequestLinesStatus';
import { useListMembersQuery } from '@/api/endpoints/membersApi';
import { FiltersDrawer } from '@/components/FiltersDrawer';

export type RequestLinesStatusFilter = RequestLineStatusFilter | 'ALL';

export interface RequestLinesFilterState {
  q: string;
  status: RequestLinesStatusFilter;
  createdByUserId: string;
  undistributed: boolean;
  withoutQuotes: boolean;
}

export const EMPTY_REQUEST_LINES_FILTERS: RequestLinesFilterState = {
  q: '',
  status: 'ALL',
  createdByUserId: '',
  undistributed: false,
  withoutQuotes: false,
};

function formatMemberLabel(member: CompanyMember): string {
  const user = member.user;
  if (!user) {
    return member.id;
  }

  const name = [user.firstName, user.lastName].filter(Boolean).join(' ').trim();
  return name || user.email;
}

interface RequestLinesFiltersDrawerProps {
  open: boolean;
  onClose: () => void;
  companyId: string;
  value: RequestLinesFilterState;
  onChange: (value: RequestLinesFilterState) => void;
  onApply: () => void;
  onReset: () => void;
}

export function RequestLinesFiltersDrawer({
  open,
  onClose,
  companyId,
  value,
  onChange,
  onApply,
  onReset,
}: RequestLinesFiltersDrawerProps) {
  const { t } = useTranslation('requests');

  const membersQuery = useListMembersQuery(
    { companyId },
    { skip: !companyId || !open },
  );

  const members = useMemo(
    () => (membersQuery.data?.members ?? []).filter((member) => member.user),
    [membersQuery.data?.members],
  );

  const selectedMember =
    members.find((member) => member.user?.id === value.createdByUserId) ?? null;

  function patch(partial: Partial<RequestLinesFilterState>) {
    onChange({ ...value, ...partial });
  }

  return (
    <FiltersDrawer
      open={open}
      onClose={onClose}
      title={t('requestLines.filters.title')}
      closeAriaLabel={t('requestLines.filters.close')}
      applyLabel={t('requestLines.filters.apply')}
      resetLabel={t('requestLines.filters.reset')}
      onApply={onApply}
      onReset={onReset}
    >
      <TextField
        label={t('requestLines.filters.q')}
        value={value.q}
        onChange={(event) => patch({ q: event.target.value })}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            onApply();
          }
        }}
        fullWidth
      />

      <FormControl fullWidth>
        <InputLabel id="request-lines-status-filter">
          {t('requestLines.filters.status')}
        </InputLabel>
        <Select
          labelId="request-lines-status-filter"
          label={t('requestLines.filters.status')}
          value={value.status}
          onChange={(event) =>
            patch({ status: event.target.value as RequestLinesStatusFilter })
          }
        >
          <MenuItem value="ALL">{t('statusFilter.all')}</MenuItem>
          {Object.values(GetCompaniesCompanyIdRequestLinesStatus).map((status) => (
            <MenuItem key={status} value={status}>
              {t(`statusFilter.${status.toLowerCase()}`, {
                defaultValue: status,
              })}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Autocomplete
        options={members}
        value={selectedMember}
        loading={membersQuery.isFetching}
        onChange={(_event, member) =>
          patch({ createdByUserId: member?.user?.id ?? '' })
        }
        getOptionLabel={formatMemberLabel}
        isOptionEqualToValue={(option, optionValue) => option.id === optionValue.id}
        renderInput={(params) => (
          <TextField {...params} label={t('requestLines.filters.createdBy')} />
        )}
      />

      <Stack>
        <FormControlLabel
          control={
            <Checkbox
              checked={value.undistributed}
              onChange={(event) => patch({ undistributed: event.target.checked })}
            />
          }
          label={t('requestLines.filters.undistributed')}
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={value.withoutQuotes}
              onChange={(event) => patch({ withoutQuotes: event.target.checked })}
            />
          }
          label={t('requestLines.filters.withoutQuotes')}
        />
      </Stack>
    </FiltersDrawer>
  );
}
