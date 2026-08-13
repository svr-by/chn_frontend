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
import {
  dateInputToIsoEndOfDay,
  isoToDateInputValue,
} from '@/lib/dateInput';

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

export function RequestPriorityEditButton({
  companyId,
  request,
}: {
  companyId: string;
  request: MaterialRequest;
}) {
  const { t } = useTranslation('requests');
  const { save, error, isLoading } = useRequestHeaderSave(companyId, request);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(request.priority);

  useEffect(() => {
    if (open) {
      setDraft(request.priority);
    }
  }, [open, request.priority]);

  async function handleSave() {
    if (draft === request.priority) {
      setOpen(false);
      return;
    }

    await save({ priority: draft });
    setOpen(false);
  }

  return (
    <>
      <Tooltip title={t('form.editPriority')}>
        <IconButton
          size="small"
          aria-label={t('form.editPriority')}
          onClick={() => setOpen(true)}
          disabled={isLoading}
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
        <DialogTitle>{t('form.editPriority')}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <ApiErrorAlert error={error} />
            <FormControl size="small" fullWidth>
              <InputLabel id="request-priority-edit-label">
                {t('form.priority')}
              </InputLabel>
              <Select
                labelId="request-priority-edit-label"
                label={t('form.priority')}
                value={draft}
                onChange={(event) => {
                  setDraft(event.target.value as MaterialRequest['priority']);
                }}
              >
                {PRIORITY_OPTIONS.map((priority) => (
                  <MenuItem key={priority} value={priority}>
                    {t(
                      `enums:materialRequestPriority.${priority.toLowerCase()}`,
                    )}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
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

export function RequestAssigneeEditButton({
  companyId,
  request,
}: {
  companyId: string;
  request: MaterialRequest;
}) {
  const { t } = useTranslation('requests');
  const { save, error, isLoading } = useRequestHeaderSave(companyId, request);
  const [open, setOpen] = useState(false);
  const [draftAssigneeUserId, setDraftAssigneeUserId] = useState<
    string | ''
  >(request.assigneeUserId ?? '');

  useEffect(() => {
    if (open) {
      setDraftAssigneeUserId(request.assigneeUserId ?? '');
    }
  }, [open, request.assigneeUserId]);

  const membersQuery = useListMembersQuery(
    { companyId },
    { skip: !companyId || !open },
  );

  const members = useMemo(
    () =>
      (membersQuery.data?.members ?? []).filter((member) => member.user),
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

  async function handleSave() {
    const next = draftAssigneeUserId || null;
    if (next === request.assigneeUserId) {
      setOpen(false);
      return;
    }

    await save({ assigneeUserId: next });
    setOpen(false);
  }

  return (
    <>
      <Tooltip title={t('form.editAssignee')}>
        <IconButton
          size="small"
          aria-label={t('form.editAssignee')}
          onClick={() => setOpen(true)}
          disabled={isLoading}
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
        <DialogTitle>{t('form.editAssignee')}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <ApiErrorAlert error={error} />
            <FormControl size="small" fullWidth>
              <InputLabel id="request-assignee-edit-label">
                {t('form.assignee')}
              </InputLabel>
              <Select
                labelId="request-assignee-edit-label"
                label={t('form.assignee')}
                value={draftAssigneeUserId}
                onChange={(event) => {
                  const next = event.target.value as string;
                  setDraftAssigneeUserId(next as string);
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

export function RequestDueDateEditButton({
  companyId,
  request,
}: {
  companyId: string;
  request: MaterialRequest;
}) {
  const { t } = useTranslation('requests');
  const { save, error, isLoading } = useRequestHeaderSave(companyId, request);
  const [open, setOpen] = useState(false);
  const [draftDueDateInputValue, setDraftDueDateInputValue] = useState(
    isoToDateInputValue(request.dueDate),
  );

  useEffect(() => {
    if (open) {
      setDraftDueDateInputValue(isoToDateInputValue(request.dueDate));
    }
  }, [open, request.dueDate]);

  async function handleSave() {
    const next = draftDueDateInputValue
      ? dateInputToIsoEndOfDay(draftDueDateInputValue)
      : null;

    if (next === request.dueDate) {
      setOpen(false);
      return;
    }

    await save({ dueDate: next });
    setOpen(false);
  }

  return (
    <>
      <Tooltip title={t('form.editDueDate')}>
        <IconButton
          size="small"
          aria-label={t('form.editDueDate')}
          onClick={() => setOpen(true)}
          disabled={isLoading}
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
        <DialogTitle>{t('form.editDueDate')}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <ApiErrorAlert error={error} />
            <TextField
              label={t('form.dueDate')}
              type="date"
              size="small"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={draftDueDateInputValue}
              onChange={(event) => {
                setDraftDueDateInputValue(event.target.value);
              }}
              autoFocus
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

export function RequestNotesEditButton({
  companyId,
  request,
}: {
  companyId: string;
  request: MaterialRequest;
}) {
  const { t } = useTranslation('requests');
  const { save, error, isLoading } = useRequestHeaderSave(companyId, request);
  const [open, setOpen] = useState(false);
  const [draftNotes, setDraftNotes] = useState(request.notes ?? '');

  useEffect(() => {
    if (open) {
      setDraftNotes(request.notes ?? '');
    }
  }, [open, request.notes]);

  async function handleSave() {
    const trimmed = draftNotes.trim();
    const next = trimmed ? trimmed : null;

    if (next === request.notes) {
      setOpen(false);
      return;
    }

    await save({ notes: next });
    setOpen(false);
  }

  return (
    <>
      <Tooltip title={t('form.editNotes')}>
        <IconButton
          size="small"
          aria-label={t('form.editNotes')}
          onClick={() => setOpen(true)}
          disabled={isLoading}
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
        <DialogTitle>{t('form.editNotes')}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <ApiErrorAlert error={error} />
            <TextField
              label={t('form.notes')}
              fullWidth
              multiline
              minRows={3}
              size="small"
              autoFocus
              value={draftNotes}
              onChange={(event) => setDraftNotes(event.target.value)}
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

  const dueDateValue = isoToDateInputValue(request.dueDate);

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
            await save({ dueDate: dateInputToIsoEndOfDay(next) });
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

