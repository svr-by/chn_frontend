import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import { useTranslation } from 'react-i18next';

import { GetCompaniesCompanyIdRequestsSortBy } from '@/api/generated/models/getCompaniesCompanyIdRequestsSortBy';
import { GetCompaniesCompanyIdRequestsSortOrder } from '@/api/generated/models/getCompaniesCompanyIdRequestsSortOrder';
import {
  REQUEST_PRIORITY_OPTIONS,
  applyPeopleQueueFilter,
  getPeopleQueueFilter,
  type RequestsFiltersValue,
  type RequestsPeopleQueueFilter,
  type RequestsTab,
} from '@/features/requests/lib/requestsFilters';
import type { MaterialRequestStatus } from '@/types/api';
import { RequestStatusFilter } from '@/features/requests/components/requestsFilters/RequestStatusFilter';

export type RequestsBuyerOption = {
  label: string;
  value: string;
};

export type RequestsMemberOption = {
  label: string;
  value: string;
};

interface RequestsFiltersFormProps {
  filters: RequestsFiltersValue;
  statusOptions: Array<MaterialRequestStatus | 'ALL'>;
  tab: RequestsTab;
  buyerOptions?: RequestsBuyerOption[];
  memberOptions?: RequestsMemberOption[];
  canFilterByMember?: boolean;
  currentUserId?: string | null;
  onChange: (next: RequestsFiltersValue) => void;
}

export function RequestsFiltersForm({
  filters,
  statusOptions,
  tab,
  buyerOptions = [],
  memberOptions = [],
  canFilterByMember = false,
  currentUserId = null,
  onChange,
}: RequestsFiltersFormProps) {
  const { t } = useTranslation(['requests', 'enums']);
  const dateFromLabel =
    tab === 'inbound'
      ? t('requests:filters.distributedFrom')
      : t('requests:filters.createdFrom');
  const dateToLabel =
    tab === 'inbound'
      ? t('requests:filters.distributedTo')
      : t('requests:filters.createdTo');

  return (
    <Stack spacing={2}>
      <RequestStatusFilter
        value={filters.status}
        options={statusOptions}
        onChange={(status) => onChange({ ...filters, status })}
      />

      <TextField
        label={t('requests:filters.q')}
        value={filters.q}
        onChange={(event) => onChange({ ...filters, q: event.target.value })}
        size="small"
        sx={{ width: '100%', minWidth: 0 }}
      />

      <FormControl size="small" sx={{ width: '100%', minWidth: 0 }}>
        <InputLabel id="request-priority-filter">
          {t('requests:filters.priority')}
        </InputLabel>
        <Select
          labelId="request-priority-filter"
          label={t('requests:filters.priority')}
          value={filters.priority}
          onChange={(event) =>
            onChange({
              ...filters,
              priority: event.target.value as RequestsFiltersValue['priority'],
            })
          }
        >
          {REQUEST_PRIORITY_OPTIONS.map((priority) => (
            <MenuItem key={priority} value={priority}>
              {priority === 'ALL'
                ? t('requests:filters.priorityAll')
                : t(
                    `enums:materialRequestPriority.${priority.toLowerCase()}`,
                  )}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {tab === 'inbound' ? (
        <FormControl size="small" sx={{ width: '100%', minWidth: 0 }}>
          <InputLabel id="request-buyer-filter">
            {t('requests:filters.buyerCompany')}
          </InputLabel>
          <Select
            labelId="request-buyer-filter"
            label={t('requests:filters.buyerCompany')}
            value={filters.buyerCompanyId}
            onChange={(event) =>
              onChange({
                ...filters,
                buyerCompanyId: event.target.value,
              })
            }
          >
            {buyerOptions.map((option) => (
              <MenuItem key={option.value || 'all'} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      ) : null}

      <Stack
        direction="row"
        spacing={1}
        useFlexGap
        sx={{ width: '100%', flexWrap: 'nowrap', minWidth: 0 }}
      >
        <TextField
          label={dateFromLabel}
          type="date"
          size="small"
          value={filters.createdFrom}
          onChange={(event) =>
            onChange({ ...filters, createdFrom: event.target.value })
          }
          slotProps={{ inputLabel: { shrink: true } }}
          sx={{ flex: 1, minWidth: 0 }}
        />
        <TextField
          label={dateToLabel}
          type="date"
          size="small"
          value={filters.createdTo}
          onChange={(event) =>
            onChange({ ...filters, createdTo: event.target.value })
          }
          slotProps={{ inputLabel: { shrink: true } }}
          sx={{ flex: 1, minWidth: 0 }}
        />
      </Stack>

      <FormControl size="small" sx={{ width: '100%', minWidth: 0 }}>
        <InputLabel id="request-sort-by-filter">
          {t('requests:filters.sortBy')}
        </InputLabel>
        <Select
          labelId="request-sort-by-filter"
          label={t('requests:filters.sortBy')}
          value={filters.sortBy}
          onChange={(event) =>
            onChange({
              ...filters,
              sortBy: event.target.value as RequestsFiltersValue['sortBy'],
            })
          }
        >
          <MenuItem value="">{t('requests:filters.sortDefault')}</MenuItem>
          <MenuItem value={GetCompaniesCompanyIdRequestsSortBy.createdAt}>
            {t('requests:filters.sortCreatedAt')}
          </MenuItem>
          <MenuItem value={GetCompaniesCompanyIdRequestsSortBy.updatedAt}>
            {t('requests:filters.sortUpdatedAt')}
          </MenuItem>
        </Select>
      </FormControl>

      <FormControl
        size="small"
        sx={{ width: '100%', minWidth: 0 }}
        disabled={!filters.sortBy}
      >
        <InputLabel id="request-sort-order-filter">
          {t('requests:filters.sortOrder')}
        </InputLabel>
        <Select
          labelId="request-sort-order-filter"
          label={t('requests:filters.sortOrder')}
          value={filters.sortOrder}
          onChange={(event) =>
            onChange({
              ...filters,
              sortOrder: event.target
                .value as RequestsFiltersValue['sortOrder'],
            })
          }
        >
          <MenuItem value="">{t('requests:filters.sortDefault')}</MenuItem>
          <MenuItem value={GetCompaniesCompanyIdRequestsSortOrder.desc}>
            {t('requests:filters.sortDesc')}
          </MenuItem>
          <MenuItem value={GetCompaniesCompanyIdRequestsSortOrder.asc}>
            {t('requests:filters.sortAsc')}
          </MenuItem>
        </Select>
      </FormControl>

      {tab === 'outbound' ? (
        canFilterByMember ? (
          <>
            <FormControl size="small" sx={{ width: '100%', minWidth: 0 }}>
              <InputLabel id="request-created-by-filter">
                {t('requests:filters.createdBy')}
              </InputLabel>
              <Select
                labelId="request-created-by-filter"
                label={t('requests:filters.createdBy')}
                value={filters.createdByUserId}
                onChange={(event) =>
                  onChange({
                    ...filters,
                    createdByUserId: event.target.value,
                  })
                }
              >
                {memberOptions.map((option) => (
                  <MenuItem key={option.value || 'all'} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ width: '100%', minWidth: 0 }}>
              <InputLabel id="request-assignee-filter">
                {t('requests:filters.assignee')}
              </InputLabel>
              <Select
                labelId="request-assignee-filter"
                label={t('requests:filters.assignee')}
                value={filters.assigneeUserId}
                onChange={(event) =>
                  onChange({
                    ...filters,
                    assigneeUserId: event.target.value,
                  })
                }
              >
                {memberOptions.map((option) => (
                  <MenuItem key={option.value || 'all'} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </>
        ) : (
          <ToggleButtonGroup
            exclusive
            size="small"
            fullWidth
            value={getPeopleQueueFilter(filters, currentUserId)}
            onChange={(_event, value: RequestsPeopleQueueFilter | null) => {
              if (value) {
                onChange(applyPeopleQueueFilter(filters, value, currentUserId));
              }
            }}
          >
            <ToggleButton value="ALL">
              {t('requests:filters.queueAll')}
            </ToggleButton>
            <ToggleButton value="CREATED_BY_ME">
              {t('requests:filters.queueCreatedByMe')}
            </ToggleButton>
            <ToggleButton value="ASSIGNED_TO_ME">
              {t('requests:filters.queueAssignedToMe')}
            </ToggleButton>
          </ToggleButtonGroup>
        )
      ) : null}
    </Stack>
  );
}
