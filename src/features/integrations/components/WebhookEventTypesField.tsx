import { Autocomplete, TextField } from '@mui/material';
import {
  Controller,
  type Control,
  type FieldValues,
  type Path,
} from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { WEBHOOK_EVENT_TYPES } from '@/lib/webhookEventTypes';

interface WebhookEventTypesFieldProps<T extends FieldValues> {
  control: Control<T>;
  name?: Path<T>;
}

export function WebhookEventTypesField<T extends FieldValues>({
  control,
  name = 'eventTypes' as Path<T>,
}: WebhookEventTypesFieldProps<T>) {
  const { t } = useTranslation('integrations');

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <Autocomplete
          multiple
          options={[...WEBHOOK_EVENT_TYPES]}
          value={field.value}
          onChange={(_event, value) => field.onChange(value)}
          getOptionLabel={(option) =>
            t(`webhookEventTypes.${option}`, { defaultValue: option })
          }
          renderInput={(params) => (
            <TextField
              {...params}
              label={t('webhooks.fields.eventTypes')}
              error={Boolean(fieldState.error)}
              helperText={
                fieldState.error?.message ?? t('webhooks.eventTypesHint')
              }
            />
          )}
        />
      )}
    />
  );
}
