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
  Stack,
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
  useCreateApiKeyMutation,
  useListApiKeysQuery,
  useRevokeApiKeyMutation,
} from '@/api/endpoints/integrationApi';
import { CompanyApiKeyScopesItem } from '@/api/generated/models/companyApiKeyScopesItem';
import { ApiErrorAlert } from '@/components/ApiErrorAlert';
import { IntegrationScopesField } from '@/features/integrations/components/IntegrationScopesField';
import { SecretRevealDialog } from '@/features/integrations/components/SecretRevealDialog';
import { READ_ONLY_SCOPE_PRESET } from '@/lib/integrationScopes';

const createApiKeySchema = z.object({
  name: z.string().min(1).max(255),
  scopes: z
    .array(z.nativeEnum(CompanyApiKeyScopesItem))
    .min(1, 'Select at least one scope'),
  expiresAt: z.string().optional(),
});

type CreateApiKeyFormValues = z.infer<typeof createApiKeySchema>;

interface ApiKeysPanelProps {
  companyId: string;
}

function formatDate(value: string | null | undefined): string {
  if (!value) {
    return '—';
  }
  return new Date(value).toLocaleString();
}

export function ApiKeysPanel({ companyId }: ApiKeysPanelProps) {
  const { t } = useTranslation('integrations');
  const { enqueueSnackbar } = useSnackbar();
  const [createOpen, setCreateOpen] = useState(false);
  const [keyToRevoke, setKeyToRevoke] = useState<string | null>(null);
  const [revealedSecret, setRevealedSecret] = useState<string | null>(null);

  const listQuery = useListApiKeysQuery({ companyId });
  const [createApiKey, createState] = useCreateApiKeyMutation();
  const [revokeApiKey, revokeState] = useRevokeApiKeyMutation();

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<CreateApiKeyFormValues>({
    resolver: zodResolver(createApiKeySchema),
    defaultValues: {
      name: '',
      scopes: READ_ONLY_SCOPE_PRESET,
      expiresAt: '',
    },
  });

  async function onCreate(values: CreateApiKeyFormValues) {
    try {
      const result = await createApiKey({
        companyId,
        name: values.name,
        scopes: values.scopes,
        expiresAt: values.expiresAt?.trim() ? values.expiresAt : undefined,
      }).unwrap();
      enqueueSnackbar(t('apiKeys.created'), { variant: 'success' });
      setCreateOpen(false);
      reset();
      setRevealedSecret(result.plainKey);
    } catch {
      // dialog shows error
    }
  }

  async function handleRevoke() {
    if (!keyToRevoke) {
      return;
    }

    try {
      await revokeApiKey({ companyId, keyId: keyToRevoke }).unwrap();
      enqueueSnackbar(t('apiKeys.revoked'), { variant: 'success' });
      setKeyToRevoke(null);
    } catch {
      // ApiErrorAlert
    }
  }

  const pageError = listQuery.error ?? createState.error ?? revokeState.error;

  return (
    <Box>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 2 }}
      >
        <Typography variant="h6">{t('apiKeys.title')}</Typography>
        <Button variant="contained" onClick={() => setCreateOpen(true)}>
          {t('apiKeys.create')}
        </Button>
      </Stack>

      <ApiErrorAlert error={pageError} />

      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>{t('apiKeys.columns.name')}</TableCell>
            <TableCell>{t('apiKeys.columns.prefix')}</TableCell>
            <TableCell>{t('apiKeys.columns.scopes')}</TableCell>
            <TableCell>{t('apiKeys.columns.lastUsed')}</TableCell>
            <TableCell>{t('apiKeys.columns.expires')}</TableCell>
            <TableCell align="right">{t('apiKeys.columns.actions')}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {(listQuery.data?.apiKeys ?? []).map((apiKey) => (
            <TableRow key={apiKey.id}>
              <TableCell>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography variant="body2">{apiKey.name}</Typography>
                  {apiKey.revokedAt ? (
                    <Chip label={t('apiKeys.revokedLabel')} size="small" color="default" />
                  ) : null}
                </Stack>
              </TableCell>
              <TableCell>
                <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                  {apiKey.keyPrefix}…
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body2">
                  {apiKey.scopes.length} {t('apiKeys.scopeCount')}
                </Typography>
              </TableCell>
              <TableCell>{formatDate(apiKey.lastUsedAt)}</TableCell>
              <TableCell>{formatDate(apiKey.expiresAt)}</TableCell>
              <TableCell align="right">
                {!apiKey.revokedAt ? (
                  <Button
                    size="small"
                    color="error"
                    onClick={() => setKeyToRevoke(apiKey.id)}
                  >
                    {t('apiKeys.revoke')}
                  </Button>
                ) : null}
              </TableCell>
            </TableRow>
          ))}
          {(listQuery.data?.apiKeys ?? []).length === 0 && !listQuery.isLoading ? (
            <TableRow>
              <TableCell colSpan={6}>
                <Typography variant="body2" color="text.secondary">
                  {t('apiKeys.empty')}
                </Typography>
              </TableCell>
            </TableRow>
          ) : null}
        </TableBody>
      </Table>

      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} fullWidth maxWidth="md">
        <DialogTitle>{t('apiKeys.create')}</DialogTitle>
        <Box component="form" onSubmit={(event) => void handleSubmit(onCreate)(event)}>
          <DialogContent>
            <ApiErrorAlert error={createState.error} />
            <TextField
              {...register('name')}
              label={t('apiKeys.fields.name')}
              fullWidth
              margin="normal"
              error={Boolean(errors.name)}
              helperText={errors.name?.message}
            />
            <TextField
              {...register('expiresAt')}
              label={t('apiKeys.fields.expiresAt')}
              type="datetime-local"
              fullWidth
              margin="normal"
              InputLabelProps={{ shrink: true }}
              helperText={t('apiKeys.fields.expiresAtHint')}
            />
            <IntegrationScopesField control={control} />
            {errors.scopes ? (
              <Typography variant="caption" color="error">
                {errors.scopes.message}
              </Typography>
            ) : null}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setCreateOpen(false)}>{t('common.cancel')}</Button>
            <Button type="submit" variant="contained" disabled={createState.isLoading}>
              {t('apiKeys.create')}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      <Dialog open={Boolean(keyToRevoke)} onClose={() => setKeyToRevoke(null)}>
        <DialogTitle>{t('apiKeys.revokeTitle')}</DialogTitle>
        <DialogContent>
          <Typography>{t('apiKeys.revokeConfirm')}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setKeyToRevoke(null)}>{t('common.cancel')}</Button>
          <Button
            color="error"
            variant="contained"
            disabled={revokeState.isLoading}
            onClick={() => void handleRevoke()}
          >
            {t('apiKeys.revoke')}
          </Button>
        </DialogActions>
      </Dialog>

      <SecretRevealDialog
        open={Boolean(revealedSecret)}
        title={t('secretReveal.apiKeyTitle')}
        secret={revealedSecret ?? ''}
        onClose={() => setRevealedSecret(null)}
      />
    </Box>
  );
}
