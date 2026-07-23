import { zodResolver } from '@hookform/resolvers/zod';
import {
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
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';

import type { SupplierInvoice } from '@/api/generated/models/supplierInvoice';
import { useRegisterPaymentMutation } from '@/api/endpoints/paymentsApi';
import { ApiErrorAlert } from '@/components/ApiErrorAlert';
import { DecimalInput } from '@/components/DecimalInput';
import { isDecimalLte, isValidDecimal } from '@/lib/decimal';

function createSchema(remainingAmount: string) {
  return z.object({
    amount: z
      .string()
      .refine(isValidDecimal, { message: 'Invalid amount' })
      .refine((value) => isDecimalLte(value, remainingAmount), {
        message: 'Amount exceeds remaining',
      }),
    notes: z.string().trim().optional(),
  });
}

type RegisterFormValues = z.infer<ReturnType<typeof createSchema>>;

interface PaymentRegisterDialogProps {
  open: boolean;
  onClose: () => void;
  companyId: string;
  invoice: SupplierInvoice;
}

export function PaymentRegisterDialog({
  open,
  onClose,
  companyId,
  invoice,
}: PaymentRegisterDialogProps) {
  const { t } = useTranslation('payments');
  const navigate = useNavigate();
  const [registerPayment, registerState] = useRegisterPaymentMutation();

  const schema = createSchema(invoice.remainingAmount);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      amount: invoice.remainingAmount,
      notes: '',
    },
  });

  const amount = watch('amount');

  async function onSubmit(values: RegisterFormValues) {
    const result = await registerPayment({
      companyId,
      invoiceId: invoice.id,
      amount: values.amount,
      notes: values.notes || undefined,
    }).unwrap();

    onClose();
    navigate(`/app/payments/${result.payment.id}`);
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      TransitionProps={{
        onEnter: () =>
          reset({
            amount: invoice.remainingAmount,
            notes: '',
          }),
      }}
    >
      <DialogTitle>{t('register.title')}</DialogTitle>
      <DialogContent>
        <ApiErrorAlert error={registerState.error} />
        <Stack
          component="form"
          id="payment-register-form"
          spacing={2}
          onSubmit={handleSubmit(onSubmit)}
          sx={{ pt: 1 }}
        >
          <DecimalInput
            label={t('register.amount')}
            fullWidth
            required
            value={amount}
            onChange={(value) =>
              setValue('amount', value, { shouldValidate: true })
            }
            error={Boolean(errors.amount)}
            helperText={errors.amount?.message}
          />
          <TextField
            label={t('register.notes')}
            fullWidth
            multiline
            minRows={2}
            {...register('notes')}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t('actions.dismiss')}</Button>
        <Button
          type="submit"
          form="payment-register-form"
          variant="contained"
          disabled={registerState.isLoading}
        >
          {t('actions.register')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
