import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
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
  useCreateMappingMutation,
  useDeleteMappingMutation,
  useListMappingsQuery,
  useUpdateMappingMutation,
} from '@/api/endpoints/integrationApi';
import type { PartnerExternalMapping } from '@/api/generated/models/partnerExternalMapping';
import { PartnerExternalMappingMappingType } from '@/api/generated/models/partnerExternalMappingMappingType';
import { ApiErrorAlert } from '@/components/feedback/apiErrorAlert/ApiErrorAlert';

const mappingSchema = z.object({
  mappingType: z.nativeEnum(PartnerExternalMappingMappingType),
  internalKey: z.string().min(1).max(255),
  externalCode: z.string().min(1).max(255),
});

type MappingFormValues = z.infer<typeof mappingSchema>;

interface MappingsPanelProps {
  companyId: string;
}

export function MappingsPanel({ companyId }: MappingsPanelProps) {
  const { t } = useTranslation('integrations');
  const { enqueueSnackbar } = useSnackbar();
  const [createOpen, setCreateOpen] = useState(false);
  const [editingMapping, setEditingMapping] =
    useState<PartnerExternalMapping | null>(null);
  const [mappingToDelete, setMappingToDelete] = useState<string | null>(null);

  const listQuery = useListMappingsQuery({ companyId });
  const [createMapping, createState] = useCreateMappingMutation();
  const [updateMapping, updateState] = useUpdateMappingMutation();
  const [deleteMapping, deleteState] = useDeleteMappingMutation();

  const isEdit = Boolean(editingMapping);
  const dialogOpen = createOpen || isEdit;

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<MappingFormValues>({
    resolver: zodResolver(mappingSchema),
    defaultValues: {
      mappingType: PartnerExternalMappingMappingType.COUNTERPARTY_CODE,
      internalKey: '',
      externalCode: '',
    },
  });

  const selectedType = watch('mappingType');

  function openCreate() {
    setEditingMapping(null);
    reset({
      mappingType: PartnerExternalMappingMappingType.COUNTERPARTY_CODE,
      internalKey: '',
      externalCode: '',
    });
    setCreateOpen(true);
  }

  function openEdit(mapping: PartnerExternalMapping) {
    setCreateOpen(false);
    setEditingMapping(mapping);
    reset({
      mappingType: mapping.mappingType,
      internalKey: mapping.internalKey,
      externalCode: mapping.externalCode,
    });
  }

  function closeDialog() {
    setCreateOpen(false);
    setEditingMapping(null);
    reset();
  }

  async function onSubmit(values: MappingFormValues) {
    try {
      if (editingMapping) {
        await updateMapping({
          companyId,
          mappingId: editingMapping.id,
          body: {
            mappingType: values.mappingType,
            internalKey: values.internalKey,
            externalCode: values.externalCode,
          },
        }).unwrap();
        enqueueSnackbar(t('mappings.updated'), { variant: 'success' });
      } else {
        await createMapping({ companyId, ...values }).unwrap();
        enqueueSnackbar(t('mappings.created'), { variant: 'success' });
      }
      closeDialog();
    } catch {
      // dialog shows error
    }
  }

  async function handleDelete() {
    if (!mappingToDelete) {
      return;
    }

    try {
      await deleteMapping({ companyId, mappingId: mappingToDelete }).unwrap();
      enqueueSnackbar(t('mappings.deleted'), { variant: 'success' });
      setMappingToDelete(null);
    } catch {
      // ApiErrorAlert
    }
  }

  const pageError =
    listQuery.error ??
    createState.error ??
    updateState.error ??
    deleteState.error;
  const mutationError = createState.error ?? updateState.error;

  return (
    <Box>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 2 }}
      >
        <Typography variant="h6">{t('mappings.title')}</Typography>
        <Button variant="contained" onClick={openCreate}>
          {t('mappings.create')}
        </Button>
      </Stack>

      <ApiErrorAlert error={pageError} />

      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>{t('mappings.columns.type')}</TableCell>
            <TableCell>{t('mappings.columns.internalKey')}</TableCell>
            <TableCell>{t('mappings.columns.externalCode')}</TableCell>
            <TableCell align="right">{t('mappings.columns.actions')}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {(listQuery.data?.mappings ?? []).map((mapping) => (
            <TableRow key={mapping.id}>
              <TableCell>{t(`mappingTypes.${mapping.mappingType}`)}</TableCell>
              <TableCell>{mapping.internalKey}</TableCell>
              <TableCell>{mapping.externalCode}</TableCell>
              <TableCell align="right">
                <Stack direction="row" spacing={1} justifyContent="flex-end">
                  <Button size="small" onClick={() => openEdit(mapping)}>
                    {t('common.edit')}
                  </Button>
                  <Button
                    size="small"
                    color="error"
                    onClick={() => setMappingToDelete(mapping.id)}
                  >
                    {t('common.delete')}
                  </Button>
                </Stack>
              </TableCell>
            </TableRow>
          ))}
          {(listQuery.data?.mappings ?? []).length === 0 &&
          !listQuery.isLoading ? (
            <TableRow>
              <TableCell colSpan={4}>
                <Typography variant="body2" color="text.secondary">
                  {t('mappings.empty')}
                </Typography>
              </TableCell>
            </TableRow>
          ) : null}
        </TableBody>
      </Table>

      <Dialog open={dialogOpen} onClose={closeDialog} fullWidth maxWidth="sm">
        <DialogTitle>
          {isEdit ? t('mappings.edit') : t('mappings.create')}
        </DialogTitle>
        <Box
          component="form"
          onSubmit={(event) => void handleSubmit(onSubmit)(event)}
        >
          <DialogContent>
            <ApiErrorAlert error={mutationError} />
            <FormControl fullWidth margin="normal">
              <InputLabel>{t('mappings.fields.type')}</InputLabel>
              <Select
                label={t('mappings.fields.type')}
                value={selectedType}
                onChange={(event) =>
                  setValue(
                    'mappingType',
                    event.target.value as MappingFormValues['mappingType'],
                  )
                }
              >
                {Object.values(PartnerExternalMappingMappingType).map(
                  (type) => (
                    <MenuItem key={type} value={type}>
                      {t(`mappingTypes.${type}`)}
                    </MenuItem>
                  ),
                )}
              </Select>
            </FormControl>
            <TextField
              {...register('internalKey')}
              label={t('mappings.fields.internalKey')}
              fullWidth
              margin="normal"
              error={Boolean(errors.internalKey)}
              helperText={
                errors.internalKey?.message ??
                t(`mappings.internalKeyHints.${selectedType}`)
              }
            />
            <TextField
              {...register('externalCode')}
              label={t('mappings.fields.externalCode')}
              fullWidth
              margin="normal"
              error={Boolean(errors.externalCode)}
              helperText={errors.externalCode?.message}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={closeDialog}>{t('common.cancel')}</Button>
            <Button
              type="submit"
              variant="contained"
              disabled={createState.isLoading || updateState.isLoading}
            >
              {isEdit ? t('common.save') : t('mappings.create')}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      <Dialog
        open={Boolean(mappingToDelete)}
        onClose={() => setMappingToDelete(null)}
      >
        <DialogTitle>{t('mappings.deleteTitle')}</DialogTitle>
        <DialogContent>
          <Typography>{t('mappings.deleteConfirm')}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMappingToDelete(null)}>
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
    </Box>
  );
}
