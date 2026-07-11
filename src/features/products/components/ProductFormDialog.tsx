import { useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Stack,
  TextField,
} from '@mui/material';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';

import type { Product } from '@/api/generated/models/product';
import {
  useCreateProductMutation,
  useUpdateProductMutation,
} from '@/api/endpoints/productsApi';
import { ApiErrorAlert } from '@/components/ApiErrorAlert';

const productSchema = z.object({
  name: z.string().trim().min(1),
  sku: z.string().trim().optional(),
  description: z.string().trim().optional(),
  unit: z.string().trim().optional(),
  isActive: z.boolean().optional(),
});

type ProductFormValues = z.infer<typeof productSchema>;

interface ProductFormDialogProps {
  open: boolean;
  onClose: () => void;
  companyId: string;
  product?: Product | null;
  onSuccess?: () => void;
}

export function ProductFormDialog({
  open,
  onClose,
  companyId,
  product,
  onSuccess,
}: ProductFormDialogProps) {
  const { t } = useTranslation('products');
  const isEdit = Boolean(product);

  const [createProduct, createState] = useCreateProductMutation();
  const [updateProduct, updateState] = useUpdateProductMutation();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      sku: '',
      description: '',
      unit: '',
      isActive: true,
    },
  });

  useEffect(() => {
    if (!open) {
      return;
    }

    reset({
      name: product?.name ?? '',
      sku: product?.sku ?? '',
      description: product?.description ?? '',
      unit: product?.unit ?? '',
      isActive: product?.isActive ?? true,
    });
  }, [open, product, reset]);

  const pageError = createState.error ?? updateState.error;
  const isSubmitting = createState.isLoading || updateState.isLoading;

  async function onSubmit(values: ProductFormValues) {
    const payload = {
      name: values.name,
      sku: values.sku || undefined,
      description: values.description || undefined,
      unit: values.unit || undefined,
    };

    if (isEdit && product) {
      await updateProduct({
        companyId,
        productId: product.id,
        ...payload,
        isActive: values.isActive,
      }).unwrap();
    } else {
      await createProduct({
        companyId,
        ...payload,
      }).unwrap();
    }

    onSuccess?.();
    onClose();
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        {isEdit ? t('form.editTitle') : t('form.createTitle')}
      </DialogTitle>
      <Box component="form" onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          <ApiErrorAlert error={pageError} />
          <Stack spacing={2}>
            <TextField
              label={t('form.name')}
              fullWidth
              required
              error={Boolean(errors.name)}
              helperText={errors.name?.message}
              {...register('name')}
            />
            <TextField
              label={t('form.sku')}
              fullWidth
              {...register('sku')}
            />
            <TextField
              label={t('form.unit')}
              fullWidth
              {...register('unit')}
            />
            <TextField
              label={t('form.description')}
              fullWidth
              multiline
              minRows={2}
              {...register('description')}
            />
            {isEdit ? (
              <FormControlLabel
                control={
                  <Checkbox
                    checked={watch('isActive') ?? true}
                    {...register('isActive')}
                  />
                }
                label={t('form.isActive')}
              />
            ) : null}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={isSubmitting}>
            {t('actions.cancel')}
          </Button>
          <Button type="submit" variant="contained" disabled={isSubmitting}>
            {isEdit ? t('actions.save') : t('actions.create')}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
