import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import AssignmentIndOutlinedIcon from '@mui/icons-material/AssignmentIndOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import EventOutlinedIcon from '@mui/icons-material/EventOutlined';
import FlagOutlinedIcon from '@mui/icons-material/FlagOutlined';
import NotesOutlinedIcon from '@mui/icons-material/NotesOutlined';
import { useTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';

import type { MaterialRequest } from '@/api/generated/models/materialRequest';
import { MaterialRequestPriority } from '@/api/generated/models/materialRequestPriority';
import type { PatchCompaniesCompanyIdRequestsRequestIdBody } from '@/api/generated/models/patchCompaniesCompanyIdRequestsRequestIdBody';
import { useListMembersQuery } from '@/api/endpoints/membersApi';
import { useUpdateRequestMutation } from '@/api/endpoints/requestsApi';
import { ApiErrorAlert } from '@/components/ApiErrorAlert';
import { AutosaveTextField } from '@/components/AutosaveTextField';

const PRIORITY_OPTIONS = Object.values(MaterialRequestPriority);
const TITLE_MIN_LENGTH = 3;

interface RequestHeaderFieldsProps {
  companyId: string;
  request: MaterialRequest;
  editable: boolean;
}

function formatMemberName(firstName?: string | null, lastName?: string | null) {
  return [firstName, lastName].filter(Boolean).join(' ').trim();
}

function toDateInputValue(iso: string | null | undefined): string {
  if (!iso) {
    return '';
  }
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return '';
  }
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/** Local calendar date → ISO at end of that local day. */
function toEndOfDayIso(dateInput: string): string {
  const [year, month, day] = dateInput.split('-').map(Number);
  const end = new Date(year, month - 1, day, 23, 59, 59, 999);
  return end.toISOString();
}

function useRequestHeaderSave(companyId: string, request: MaterialRequest) {
  const { t } = useTranslation('requests');
  const { enqueueSnackbar } = useSnackbar();
  const [updateRequest, updateState] = useUpdateRequestMutation();

  const save = useCallback(
    async (
      patch: PatchCompaniesCompanyIdRequestsRequestIdBody,
    ): Promise<void> => {
      await updateRequest({
        companyId,
        requestId: request.id,
        ...patch,
      }).unwrap();
      enqueueSnackbar(t('toast.updated'), { variant: 'success' });
    },
    [companyId, enqueueSnackbar, request.id, t, updateRequest],
  );

  return { save, error: updateState.error, isLoading: updateState.isLoading };
}

export function RequestTitleEditButton({
  companyId,
  request,
}: {
  companyId: string;
  request: MaterialRequest;
}) {
  const { t } = useTranslation(['requests', 'validation']);
  const { save, error, isLoading } = useRequestHeaderSave(companyId, request);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(request.title);
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setDraft(request.title);
      setLocalError(null);
    }
  }, [open, request.title]);

  async function handleSave() {
    const trimmed = draft.trim();
    if (trimmed.length < TITLE_MIN_LENGTH) {
      setLocalError(t('validation:minLength', { min: TITLE_MIN_LENGTH }));
      return;
    }

    if (trimmed === request.title) {
      setOpen(false);
      return;
    }

    await save({ title: trimmed });
    setOpen(false);
  }

  return (
    <>
      <Tooltip title={t('actions.editTitle')}>
        <IconButton
          size="small"
          aria-label={t('actions.editTitle')}
          onClick={() => setOpen(true)}
        >
          <EditOutlinedIcon fontSize="small" />
        </IconButton>
      </Tooltip>

      <Dialog
        open={open}
        onClose={() => !isLoading && setOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>{t('form.editTitle')}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <ApiErrorAlert error={error} />
            <TextField
              label={t('form.title')}
              fullWidth
              autoFocus
              value={draft}
              onChange={(event) => {
                setDraft(event.target.value);
                setLocalError(null);
              }}
              error={Boolean(localError)}
              helperText={localError}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault();
                  void handleSave();
                }
              }}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)} disabled={isLoading}>
            {t('actions.cancel')}
          </Button>
          <Button
            variant="contained"
            onClick={() => void handleSave()}
            disabled={isLoading}
          >
            {t('actions.save')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export function RequestHeaderFields({
  companyId,
  request,
  editable,
}: RequestHeaderFieldsProps) {
  const { t } = useTranslation(['requests', 'enums']);
  const { save, error } = useRequestHeaderSave(companyId, request);

  const membersQuery = useListMembersQuery(
    { companyId },
    { skip: !companyId || !editable },
  );

  const members = useMemo(
    () => (membersQuery.data?.members ?? []).filter((member) => member.user),
    [membersQuery.data?.members],
  );

  const assigneeOptions = useMemo(() => {
    const options = members.map((member) => {
      const user = member.user!;
      return {
        id: user.id,
        label: formatMemberName(user.firstName, user.lastName) || user.email,
      };
    });

    if (
      request.assigneeUserId &&
      !options.some((option) => option.id === request.assigneeUserId)
    ) {
      options.unshift({
        id: request.assigneeUserId,
        label: request.assigneeUserName ?? request.assigneeUserId,
      });
    }

    return options;
  }, [members, request.assigneeUserId, request.assigneeUserName]);

  const dueDateValue = toDateInputValue(request.dueDate);

  if (!editable) {
    return (
      <Stack spacing={1}>
        <ApiErrorAlert error={error} />
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          useFlexGap
          flexWrap="wrap"
        >
          <Stack direction="row" spacing={1} alignItems="center">
            <FlagOutlinedIcon fontSize="small" color="action" />
            <Typography variant="body2" color="text.secondary">
              {t('form.priority')}:{' '}
              {t(
                `enums:materialRequestPriority.${request.priority.toLowerCase()}`,
              )}
            </Typography>
          </Stack>
          {request.assigneeUserName ? (
            <Stack direction="row" spacing={1} alignItems="center">
              <AssignmentIndOutlinedIcon fontSize="small" color="action" />
              <Typography variant="body2" color="text.secondary">
                {t('form.assignee')}: {request.assigneeUserName}
              </Typography>
            </Stack>
          ) : null}
          {request.dueDate ? (
            <Stack direction="row" spacing={1} alignItems="center">
              <EventOutlinedIcon fontSize="small" color="action" />
              <Typography variant="body2" color="text.secondary">
                {t('form.dueDate')}:{' '}
                {new Date(request.dueDate).toLocaleDateString()}
              </Typography>
            </Stack>
          ) : null}
        </Stack>
      </Stack>
    );
  }

  return (
    <Stack spacing={1.5}>
      <ApiErrorAlert error={error} />
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={1.5}
        alignItems={{ sm: 'flex-start' }}
      >
        <FormControl sx={{ width: { xs: '100%', sm: 180 } }} size="small">
          <InputLabel id="request-priority-label">
            {t('form.priority')}
          </InputLabel>
          <Select
            labelId="request-priority-label"
            label={t('form.priority')}
            value={request.priority}
            onChange={(event) => {
              const next = event.target.value as MaterialRequest['priority'];
              if (next === request.priority) {
                return;
              }
              void save({ priority: next });
            }}
          >
            {PRIORITY_OPTIONS.map((priority) => (
              <MenuItem key={priority} value={priority}>
                {t(`enums:materialRequestPriority.${priority.toLowerCase()}`)}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl sx={{ width: { xs: '100%', sm: 220 } }} size="small">
          <InputLabel id="request-assignee-label">
            {t('form.assignee')}
          </InputLabel>
          <Select
            labelId="request-assignee-label"
            label={t('form.assignee')}
            value={request.assigneeUserId ?? ''}
            onChange={(event) => {
              const next = event.target.value;
              const current = request.assigneeUserId ?? '';
              if (next === current) {
                return;
              }
              void save({ assigneeUserId: next || null });
            }}
          >
            <MenuItem value="">
              <em>{t('form.assigneeUnassigned')}</em>
            </MenuItem>
            {assigneeOptions.map((option) => (
              <MenuItem key={option.id} value={option.id}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <AutosaveTextField
          label={t('form.dueDate')}
          type="date"
          size="small"
          InputLabelProps={{ shrink: true }}
          sx={{ width: { xs: '100%', sm: 200 } }}
          value={dueDateValue}
          onCommit={async (next) => {
            if (!next) {
              await save({ dueDate: null });
              return;
            }
            await save({ dueDate: toEndOfDayIso(next) });
          }}
        />
      </Stack>
    </Stack>
  );
}

export function RequestNotesField({
  companyId,
  request,
  editable,
}: RequestHeaderFieldsProps) {
  const { t } = useTranslation('requests');
  const { save, error } = useRequestHeaderSave(companyId, request);

  if (!editable) {
    if (!request.notes) {
      return null;
    }

    return (
      <Stack spacing={1}>
        <Stack direction="row" spacing={1} alignItems="center">
          <NotesOutlinedIcon fontSize="small" color="action" />
          <Typography variant="subtitle2">{t('form.notes')}</Typography>
        </Stack>
        <Typography variant="body2" color="text.secondary" whiteSpace="pre-wrap">
          {request.notes}
        </Typography>
      </Stack>
    );
  }

  return (
    <Box>
      <ApiErrorAlert error={error} />
      <AutosaveTextField
        label={t('form.notes')}
        fullWidth
        multiline
        minRows={2}
        size="small"
        value={request.notes ?? ''}
        onCommit={async (next) => {
          await save({ notes: next.trim() ? next : null });
        }}
      />
    </Box>
  );
}
