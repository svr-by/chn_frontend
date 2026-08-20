import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';
import { z } from 'zod';

import {
  useCreateWebhookMutation,
  useDeleteWebhookMutation,
  useListWebhooksQuery,
  useUpdateWebhookMutation,
} from '@/api/endpoints/integrationApi';
import type { IntegrationWebhook } from '@/api/generated/models/integrationWebhook';
import { ApiErrorAlert } from '@/components/feedback/apiErrorAlert/ApiErrorAlert';
import { SecretRevealDialog } from '@/features/integrations/components/SecretRevealDialog';
import { WebhookEventTypesField } from '@/features/integrations/components/WebhookEventTypesField';

const createWebhookSchema = z.object({
  url: z.string().url(),
  eventTypes: z.array(z.string()).min(1),
});

const editWebhookSchema = createWebhookSchema.extend({
  isActive: z.boolean(),
});

type CreateWebhookFormValues = z.infer<typeof createWebhookSchema>;
type EditWebhookFormValues = z.infer<typeof editWebhookSchema>;

interface WebhooksPanelProps {
  companyId: string;
}

export function WebhooksPanel({ companyId }: WebhooksPanelProps) {
  const { t } = useTranslation('integrations');
  const { enqueueSnackbar } = useSnackbar();
  const [createOpen, setCreateOpen] = useState(false);
  const [editingWebhook, setEditingWebhook] =
    useState<IntegrationWebhook | null>(null);
  const [webhookToDelete, setWebhookToDelete] = useState<string | null>(null);
  const [revealedSecret, setRevealedSecret] = useState<string | null>(null);

  const listQuery = useListWebhooksQuery({ companyId });
  const [createWebhook, createState] = useCreateWebhookMutation();
  const [updateWebhook, updateState] = useUpdateWebhookMutation();
  const [deleteWebhook, deleteState] = useDeleteWebhookMutation();

  const isEdit = Boolean(editingWebhook);

  const createForm = useForm<CreateWebhookFormValues>({
    resolver: zodResolver(createWebhookSchema),
    defaultValues: { url: '', eventTypes: [] },
  });

  const editForm = useForm<EditWebhookFormValues>({
    resolver: zodResolver(editWebhookSchema),
    defaultValues: { url: '', eventTypes: [], isActive: true },
  });

  function openCreate() {
    setEditingWebhook(null);
    createForm.reset({ url: '', eventTypes: [] });
    setCreateOpen(true);
  }

  function openEdit(webhook: IntegrationWebhook) {
    setCreateOpen(false);
    setEditingWebhook(webhook);
    editForm.reset({
      url: webhook.url,
      eventTypes: webhook.eventTypes,
      isActive: webhook.isActive,
    });
  }

  function closeDialog() {
    setCreateOpen(false);
    setEditingWebhook(null);
    createForm.reset();
    editForm.reset();
  }

  async function onCreate(values: CreateWebhookFormValues) {
    try {
      const result = await createWebhook({ companyId, ...values }).unwrap();
      enqueueSnackbar(t('webhooks.created'), { variant: 'success' });
      closeDialog();
      setRevealedSecret(result.plainSecret);
    } catch {
      // dialog shows error
    }
  }

  async function onEdit(values: EditWebhookFormValues) {
    if (!editingWebhook) {
      return;
    }

    try {
      await updateWebhook({
        companyId,
        webhookId: editingWebhook.id,
        body: values,
      }).unwrap();
      enqueueSnackbar(t('webhooks.updated'), { variant: 'success' });
      closeDialog();
    } catch {
      // dialog shows error
    }
  }

  async function handleDelete() {
    if (!webhookToDelete) {
      return;
    }

    try {
      await deleteWebhook({ companyId, webhookId: webhookToDelete }).unwrap();
      enqueueSnackbar(t('webhooks.deleted'), { variant: 'success' });
      setWebhookToDelete(null);
    } catch {
      // ApiErrorAlert
    }
  }

  const pageError =
    listQuery.error ??
    createState.error ??
    updateState.error ??
    deleteState.error;

  return (
    <Box>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 2 }}
      >
        <Typography variant="h6">{t('webhooks.title')}</Typography>
        <Button variant="contained" onClick={openCreate}>
          {t('webhooks.create')}
        </Button>
      </Stack>

      <ApiErrorAlert error={pageError} />

      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>{t('webhooks.columns.url')}</TableCell>
            <TableCell>{t('webhooks.columns.events')}</TableCell>
            <TableCell>{t('webhooks.columns.status')}</TableCell>
            <TableCell align="right">{t('webhooks.columns.actions')}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {(listQuery.data?.webhooks ?? []).map((webhook) => (
            <TableRow key={webhook.id}>
              <TableCell>
                <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
                  {webhook.url}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body2">
                  {webhook.eventTypes.length} {t('webhooks.eventCount')}
                </Typography>
              </TableCell>
              <TableCell>
                <Chip
                  size="small"
                  label={
                    webhook.isActive
                      ? t('webhooks.status.active')
                      : t('webhooks.status.inactive')
                  }
                  color={webhook.isActive ? 'success' : 'default'}
                />
              </TableCell>
              <TableCell align="right">
                <Stack direction="row" spacing={1} justifyContent="flex-end">
                  <Button size="small" onClick={() => openEdit(webhook)}>
                    {t('common.edit')}
                  </Button>
                  <Button
                    size="small"
                    color="error"
                    onClick={() => setWebhookToDelete(webhook.id)}
                  >
                    {t('common.delete')}
                  </Button>
                </Stack>
              </TableCell>
            </TableRow>
          ))}
          {(listQuery.data?.webhooks ?? []).length === 0 &&
          !listQuery.isLoading ? (
            <TableRow>
              <TableCell colSpan={4}>
                <Typography variant="body2" color="text.secondary">
                  {t('webhooks.empty')}
                </Typography>
              </TableCell>
            </TableRow>
          ) : null}
        </TableBody>
      </Table>

      <Dialog open={createOpen} onClose={closeDialog} fullWidth maxWidth="sm">
        <DialogTitle>{t('webhooks.create')}</DialogTitle>
        <Box
          component="form"
          onSubmit={(event) => void createForm.handleSubmit(onCreate)(event)}
        >
          <DialogContent>
            <ApiErrorAlert error={createState.error} />
            <TextField
              {...createForm.register('url')}
              label={t('webhooks.fields.url')}
              fullWidth
              margin="normal"
              error={Boolean(createForm.formState.errors.url)}
              helperText={createForm.formState.errors.url?.message}
            />
            <WebhookEventTypesField control={createForm.control} />
          </DialogContent>
          <DialogActions>
            <Button onClick={closeDialog}>{t('common.cancel')}</Button>
            <Button
              type="submit"
              variant="contained"
              disabled={createState.isLoading}
            >
              {t('webhooks.create')}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      <Dialog open={isEdit} onClose={closeDialog} fullWidth maxWidth="sm">
        <DialogTitle>{t('webhooks.edit')}</DialogTitle>
        <Box
          component="form"
          onSubmit={(event) => void editForm.handleSubmit(onEdit)(event)}
        >
          <DialogContent>
            <ApiErrorAlert error={updateState.error} />
            <TextField
              {...editForm.register('url')}
              label={t('webhooks.fields.url')}
              fullWidth
              margin="normal"
              error={Boolean(editForm.formState.errors.url)}
              helperText={editForm.formState.errors.url?.message}
            />
            <WebhookEventTypesField control={editForm.control} />
            <FormControlLabel
              control={
                <Switch
                  checked={editForm.watch('isActive')}
                  onChange={(event) =>
                    editForm.setValue('isActive', event.target.checked)
                  }
                />
              }
              label={t('webhooks.fields.isActive')}
              sx={{ mt: 1 }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={closeDialog}>{t('common.cancel')}</Button>
            <Button
              type="submit"
              variant="contained"
              disabled={updateState.isLoading}
            >
              {t('common.save')}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      <Dialog
        open={Boolean(webhookToDelete)}
        onClose={() => setWebhookToDelete(null)}
      >
        <DialogTitle>{t('webhooks.deleteTitle')}</DialogTitle>
        <DialogContent>
          <Typography>{t('webhooks.deleteConfirm')}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setWebhookToDelete(null)}>
            {t('common.cancel')}
          </Button>
          <Button
            color="error"
            variant="contained"
            disabled={deleteState.isLoading}
            onClick={() => void handleDelete()}
          >
            {t('common.delete')}
          </Button>
        </DialogActions>
      </Dialog>

      <SecretRevealDialog
        open={Boolean(revealedSecret)}
        title={t('secretReveal.webhookTitle')}
        secret={revealedSecret ?? ''}
        onClose={() => setRevealedSecret(null)}
      />
    </Box>
  );
}
