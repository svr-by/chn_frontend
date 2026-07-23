import { useEffect, useMemo } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import {
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

// import type { Product } from '@/api/generated/models/product';
import type { RequestLine } from '@/api/generated/models/requestLine';
// import { useListProductsQuery } from '@/api/endpoints/productsApi';
import {
  useAddRequestLineMutation,
  useUpdateRequestLineMutation,
} from '@/api/endpoints/requestsApi';
import { ApiErrorAlert } from '@/components/ApiErrorAlert';
import { DecimalInput } from '@/components/DecimalInput';
import { isValidDecimal } from '@/lib/decimal';
import type {
  DraftRequestLine,
  RequestLineFormValues,
} from '@/features/requests/lib/draftRequestLine';

type ApiModeProps = {
  mode?: 'api';
  requestId: string;
  line?: RequestLine | null;
  draftLine?: never;
  onLocalSubmit?: never;
  onSuccess?: () => void;
};

type LocalModeProps = {
  mode: 'local';
  requestId?: never;
  line?: never;
  draftLine?: DraftRequestLine | null;
  onLocalSubmit: (values: RequestLineFormValues) => void;
  onSuccess?: never;
};

type RequestLineFormDialogProps = {
  open: boolean;
  onClose: () => void;
  companyId: string;
} & (ApiModeProps | LocalModeProps);

const REQUEST_LINE_FORM_ID = 'request-line-form';

const EMPTY_FORM_VALUES: RequestLineFormValues = {
  productId: null,
  description: '',
  quantity: '',
  unit: '',
  notes: '',
};

export function RequestLineFormDialog(props: RequestLineFormDialogProps) {
  const { open, onClose, companyId } = props;
  const isLocal = props.mode === 'local';
  const line = !isLocal ? props.line : undefined;
  const draftLine = isLocal ? props.draftLine : undefined;
  const isEdit = isLocal ? Boolean(draftLine) : Boolean(line);

  const { t } = useTranslation(['requests', 'validation']);

  // const [productSearch, setProductSearch] = useState('');
  // const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // const productsQuery = useListProductsQuery(
  //   {
  //     companyId,
  //     q: productSearch || undefined,
  //     isActive: 'true',
  //     limit: 20,
  //     offset: 0,
  //   },
  //   { skip: !open || !companyId },
  // );

  const [addLine, addState] = useAddRequestLineMutation();
  const [updateLine, updateState] = useUpdateRequestLineMutation();

  const lineSchema = useMemo(
    () =>
      z.object({
        productId: z
          .string()
          .uuid({ message: t('validation:invalidUuid') })
          .nullable()
          .optional(),
        description: z
          .string()
          .trim()
          .min(1, {
            message: t('validation:required'),
          }),
        quantity: z.string().refine(isValidDecimal, {
          message: t('validation:invalidQuantity'),
        }),
        unit: z.string().trim().optional(),
        notes: z.string().trim().optional(),
      }),
    [t],
  );

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<RequestLineFormValues>({
    resolver: zodResolver(lineSchema),
    defaultValues: EMPTY_FORM_VALUES,
  });

  const quantity = watch('quantity');

  useEffect(() => {
    if (!open) {
      reset(EMPTY_FORM_VALUES);
      return;
    }

    //   setProductSearch('');
    if (isLocal) {
      // setSelectedProduct(null);
      reset({
        productId: draftLine?.productId ?? null,
        description: draftLine?.description ?? '',
        quantity: draftLine?.quantity ?? '',
        unit: draftLine?.unit ?? '',
        notes: draftLine?.notes ?? '',
      });
      return;
    }

    //   setSelectedProduct(
    //     line?.product
    //       ? {
    //           id: line.product.id,
    //           companyId,
    //           name: line.product.name,
    //           sku: line.product.sku,
    //           unit: line.product.unit,
    //           description: null,
    //           attributes: null,
    //           isActive: true,
    //           createdAt: '',
    //           updatedAt: '',
    //         }
    //       : null,
    //   );

    reset({
      productId: line?.product?.id ?? null,
      description: line?.description ?? '',
      quantity: line?.quantity ?? '',
      unit: line?.unit ?? '',
      notes: line?.notes ?? '',
    });
  }, [open, line, draftLine, isLocal, reset]);

  const pageError = addState.error ?? updateState.error;
  const isSubmitting = addState.isLoading || updateState.isLoading;
  // const products = productsQuery.data?.products ?? [];

  // function handleProductChange(product: Product | null) {
  //   setSelectedProduct(product);
  //   setValue('productId', product?.id ?? null);

  //   if (product) {
  //     setValue('description', product.name);
  //     if (product.unit) {
  //       setValue('unit', product.unit);
  //     }
  //   }
  // }

  async function onSubmit(values: RequestLineFormValues) {
    if (isLocal) {
      props.onLocalSubmit(values);
      reset(EMPTY_FORM_VALUES);
      onClose();
      return;
    }

    const payload = {
      companyId,
      requestId: props.requestId,
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

    props.onSuccess?.();
    reset(EMPTY_FORM_VALUES);
    onClose();
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        {isEdit ? t('form.editLineTitle') : t('form.addLineTitle')}
      </DialogTitle>
      <DialogContent>
        {!isLocal ? <ApiErrorAlert error={pageError} /> : null}
        <Box
          component="form"
          id={REQUEST_LINE_FORM_ID}
          onSubmit={(event) => {
            event.preventDefault();
            event.stopPropagation();
            void handleSubmit(onSubmit)(event);
          }}
        >
          <Stack spacing={2} sx={{ pt: 1 }}>
            {/* <Autocomplete
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
            /> */}
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
              onChange={(value) =>
                setValue('quantity', value, { shouldValidate: true })
              }
              error={Boolean(errors.quantity)}
              helperText={errors.quantity?.message}
            />
            <TextField label={t('form.unit')} fullWidth {...register('unit')} />
            <TextField
              label={t('form.notes')}
              fullWidth
              multiline
              minRows={2}
              {...register('notes')}
            />
          </Stack>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button type="button" onClick={onClose} disabled={isSubmitting}>
          {t('actions.cancel')}
        </Button>
        <Button
          type="button"
          variant="contained"
          disabled={isSubmitting}
          onClick={() => void handleSubmit(onSubmit)()}
        >
          {isEdit ? t('actions.save') : t('actions.addLine')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
