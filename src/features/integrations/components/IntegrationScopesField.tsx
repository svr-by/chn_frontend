import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Stack,
  Typography,
} from '@mui/material';
import { Controller, type Control, type FieldValues, type Path } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import {
  applyScopePreset,
  FULL_ACCESS_SCOPE_PRESET,
  READ_ONLY_SCOPE_PRESET,
  SCOPE_GROUPS,
  toggleScope,
} from '@/lib/integrationScopes';

interface IntegrationScopesFieldProps<T extends FieldValues> {
  control: Control<T>;
  name?: Path<T>;
}

export function IntegrationScopesField<T extends FieldValues>({
  control,
  name = 'scopes' as Path<T>,
}: IntegrationScopesFieldProps<T>) {
  const { t } = useTranslation('integrations');

  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <Box>
          <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
            <Button
              size="small"
              variant="outlined"
              onClick={() => field.onChange(applyScopePreset(READ_ONLY_SCOPE_PRESET))}
            >
              {t('apiKeys.presets.readOnly')}
            </Button>
            <Button
              size="small"
              variant="outlined"
              onClick={() => field.onChange(applyScopePreset(FULL_ACCESS_SCOPE_PRESET))}
            >
              {t('apiKeys.presets.fullAccess')}
            </Button>
            <Button
              size="small"
              onClick={() => field.onChange([])}
            >
              {t('apiKeys.presets.clear')}
            </Button>
          </Stack>

          {SCOPE_GROUPS.map((group) => (
            <Box key={group.labelKey} sx={{ mb: 2 }}>
              <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                {t(`scopeGroups.${group.labelKey}`)}
              </Typography>
              <FormGroup row>
                {group.scopes.map((scope) => (
                  <FormControlLabel
                    key={scope}
                    control={
                      <Checkbox
                        size="small"
                        checked={field.value.includes(scope)}
                        onChange={() =>
                          field.onChange(toggleScope(field.value, scope))
                        }
                      />
                    }
                    label={t(`scopes.${scope}`)}
                  />
                ))}
              </FormGroup>
            </Box>
          ))}
        </Box>
      )}
    />
  );
}
