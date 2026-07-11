import { useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Autocomplete,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
} from '@mui/material';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';

import type { Product } from '@/api/generated/models/product';
import type { RequestLine } from '@/api/generated/models/requestLine';
import { useListProductsQuery } from '@/api/endpoints/productsApi';
import {
  useAddRequestLineMutation,
  useUpdateRequestLineMutation,
} from '@/api/endpoints/requestsApi';
import { ApiErrorAlert } from '@/components/ApiErrorAlert';
import { DecimalInput } from '@/components/DecimalInput';
import { isValidDecimal } from '@/lib/decimal';

const lineSchema = z.object({
  productId: z.string().uuid().nullable().optional(),
  description: z.string().trim().min(1),
  quantity: z.string().refine(isValidDecimal, {
    message: 'Invalid quantity',
  }),
  unit: z.string().trim().optional(),
  notes: z.string().trim().optional(),
});

type LineFormValues = z.infer<typeof lineSchema>;

interface RequestLineFormDialogProps {
  open: boolean;
  onClose: () => void;
  companyId: string;
  requestId: string;
  line?: RequestLine | null;
  onSuccess?: () => void;
}

export function RequestLineFormDialog({
  open,
  onClose,
  companyId,
  requestId,
  line,
  onSuccess,
}: RequestLineFormDialogProps) {
  const { t } = useTranslation('requests');
  const isEdit = Boolean(line);

  const [productSearch, setProductSearch] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const productsQuery = useListProductsQuery(
    {
      companyId,
      q: productSearch || undefined,
      isActive: 'true',
      limit: 20,
      offset: 0,
    },
    { skip: !open || !companyId },
  );

  const [addLine, addState] = useAddRequestLineMutation();
  const [updateLine, updateState] = useUpdateRequestLineMutation();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<LineFormValues>({
    resolver: zodResolver(lineSchema),
    defaultValues: {
      productId: null,
      description: '',
      quantity: '',
      unit: '',
      notes: '',
    },
  });

  const quantity = watch('quantity');

  useEffect(() => {
    if (!open) {
      return;
    }

    setProductSearch('');
    setSelectedProduct(
      line?.product
        ? {
            id: line.product.id,
            companyId,
            name: line.product.name,
            sku: line.product.sku,
            unit: line.product.unit,
            description: null,
            attributes: null,
            isActive: true,
            createdAt: '',
            updatedAt: '',
          }
        : null,
    );

    reset({
      productId: line?.product?.id ?? null,
      description: line?.description ?? '',
      quantity: line?.quantity ?? '',
      unit: line?.unit ?? '',
      notes: line?.notes ?? '',
    });
  }, [open, line, companyId, reset]);

  const pageError = addState.error ?? updateState.error;
  const isSubmitting = addState.isLoading || updateState.isLoading;
  const products = productsQuery.data?.products ?? [];

  function handleProductChange(product: Product | null) {
    setSelectedProduct(product);
    setValue('productId', product?.id ?? null);

    if (product) {
      setValue('description', product.name);
      if (product.unit) {
        setValue('unit', product.unit);
      }
    }
  }

  async function onSubmit(values: LineFormValues) {
    const payload = {
      companyId,
      requestId,
      description: values.description,
      quantity: values.quantity,
      unit: values.unit || undefined,
      notes: values.notes || undefined,
      ...(values.productId ? { productId: values.productId } : {}),
    };

    if (isEdit && line) {
      await updateLine({
        ...payload,
        lineId: line.id,
        productId: values.productId ?? null,
        unit: values.unit || null,
        notes: values.notes || null,
      }).unwrap();
    } else {
      await addLine(payload).unwrap();
    }

    onSuccess?.();
    onClose();
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        {isEdit ? t('form.editLineTitle') : t('form.addLineTitle')}
      </DialogTitle>
      <Box component="form" onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          <ApiErrorAlert error={pageError} />
          <Stack spacing={2}>
            <Autocomplete
              options={products}
              value={selectedProduct}
              onChange={(_event, value) => handleProductChange(value)}
              onInputChange={(_event, value) => setProductSearch(value)}
              getOptionLabel={(option) =>
                option.sku ? `${option.name} (${option.sku})` : option.name
              }
              isOptionEqualToValue={(option, value) => option.id === value.id}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label={t('form.product')}
                  placeholder={t('form.productPlaceholder')}
                />
              )}
            />
            <TextField
              label={t('form.description')}
              fullWidth
              required
              error={Boolean(errors.description)}
              helperText={errors.description?.message}
              {...register('description')}
            />
            <DecimalInput
              label={t('form.quantity')}
              fullWidth
              required
              value={quantity}
              onChange={(value) => setValue('quantity', value, { shouldValidate: true })}
              error={Boolean(errors.quantity)}
              helperText={errors.quantity?.message}
            />
            <TextField
              label={t('form.unit')}
              fullWidth
              {...register('unit')}
            />
            <TextField
              label={t('form.notes')}
              fullWidth
              multiline
              minRows={2}
              {...register('notes')}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={isSubmitting}>
            {t('actions.cancel')}
          </Button>
          <Button type="submit" variant="contained" disabled={isSubmitting}>
            {isEdit ? t('actions.save') : t('actions.addLine')}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
