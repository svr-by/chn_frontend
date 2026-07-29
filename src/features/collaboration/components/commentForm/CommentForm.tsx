import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Stack, TextField } from '@mui/material';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';
import { z } from 'zod';

import type { CommentDocumentType } from '@/api/generated/models/commentDocumentType';
import { useCreateDocumentCommentMutation } from '@/api/endpoints/commentsApi';
import { ApiErrorAlert } from '@/components/ApiErrorAlert';

const MAX_COMMENT_LENGTH = 4000;

const commentSchema = z.object({
  body: z
    .string()
    .trim()
    .min(1, 'required')
    .max(MAX_COMMENT_LENGTH, 'maxLength'),
});

type CommentFormValues = z.infer<typeof commentSchema>;

interface CommentFormProps {
  companyId: string;
  documentType: CommentDocumentType;
  documentId: string;
  onSuccess?: () => void;
}

export function CommentForm({
  companyId,
  documentType,
  documentId,
  onSuccess,
}: CommentFormProps) {
  const { t } = useTranslation('collaboration');
  const { enqueueSnackbar } = useSnackbar();
  const [createComment, createState] = useCreateDocumentCommentMutation();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<CommentFormValues>({
    resolver: zodResolver(commentSchema),
    defaultValues: { body: '' },
  });

  const bodyValue = watch('body') ?? '';
  const charCount = bodyValue.length;

  async function onSubmit(values: CommentFormValues) {
    try {
      await createComment({
        companyId,
        documentType,
        documentId,
        body: values.body.trim(),
      }).unwrap();
      reset({ body: '' });
      onSuccess?.();
      enqueueSnackbar(t('comments.postSuccess'), { variant: 'success' });
    } catch {
      enqueueSnackbar(t('comments.postError'), { variant: 'error' });
    }
  }

  return (
    <Stack
      component="form"
      spacing={1.5}
      onSubmit={(event) => void handleSubmit(onSubmit)(event)}
    >
      <ApiErrorAlert error={createState.error} />
      <TextField
        {...register('body')}
        label={t('comments.placeholder')}
        placeholder={t('comments.placeholder')}
        multiline
        minRows={2}
        fullWidth
        error={Boolean(errors.body)}
        helperText={
          errors.body?.message === 'maxLength'
            ? t('comments.maxLength', { max: MAX_COMMENT_LENGTH })
            : errors.body?.message === 'required'
              ? t('comments.required')
              : t('comments.charCount', {
                  count: charCount,
                  max: MAX_COMMENT_LENGTH,
                })
        }
        inputProps={{ maxLength: MAX_COMMENT_LENGTH }}
      />
      <Stack direction="row" justifyContent="flex-end">
        <Button 
          type="submit"
          variant="outlined"
          disabled={createState.isLoading}
        >
          {t('comments.submit')}
        </Button>
      </Stack>
    </Stack>
  );
}

export { MAX_COMMENT_LENGTH, commentSchema };
