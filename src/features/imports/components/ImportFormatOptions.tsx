import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
} from '@mui/material';
import { useTranslation } from 'react-i18next';

import type {
  CsvDecimalSeparator,
  CsvFieldDelimiter,
} from '@/lib/buildImportFormData';

export interface ImportFormatValues {
  fieldDelimiter: CsvFieldDelimiter;
  decimalSeparator: CsvDecimalSeparator;
  title: string;
}

interface ImportFormatOptionsProps {
  values: ImportFormatValues;
  onChange: (values: ImportFormatValues) => void;
  disabled?: boolean;
  showFieldDelimiter?: boolean;
  showTitle?: boolean;
}

const DELIMITER_OPTIONS: CsvFieldDelimiter[] = [',', ';', '\t', 'tab'];
const DECIMAL_OPTIONS: CsvDecimalSeparator[] = ['.', ','];

export function ImportFormatOptions({
  values,
  onChange,
  disabled = false,
  showFieldDelimiter = true,
  showTitle = true,
}: ImportFormatOptionsProps) {
  const { t } = useTranslation('imports');

  return (
    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
      {showFieldDelimiter ? (
        <FormControl size="small" sx={{ minWidth: 160 }} disabled={disabled}>
          <InputLabel id="import-field-delimiter">
            {t('format.fieldDelimiter')}
          </InputLabel>
          <Select
            labelId="import-field-delimiter"
            label={t('format.fieldDelimiter')}
            value={values.fieldDelimiter}
            onChange={(event) =>
              onChange({
                ...values,
                fieldDelimiter: event.target.value as CsvFieldDelimiter,
              })
            }
          >
            {DELIMITER_OPTIONS.map((delimiter) => (
              <MenuItem key={delimiter} value={delimiter}>
                {t(
                  `format.delimiters.${delimiter === '\t' ? 'tab' : delimiter}`,
                )}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      ) : null}

      <FormControl size="small" sx={{ minWidth: 160 }} disabled={disabled}>
        <InputLabel id="import-decimal-separator">
          {t('format.decimalSeparator')}
        </InputLabel>
        <Select
          labelId="import-decimal-separator"
          label={t('format.decimalSeparator')}
          value={values.decimalSeparator}
          onChange={(event) =>
            onChange({
              ...values,
              decimalSeparator: event.target.value as CsvDecimalSeparator,
            })
          }
        >
          {DECIMAL_OPTIONS.map((separator) => (
            <MenuItem key={separator} value={separator}>
              {t(`format.decimals.${separator}`)}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {showTitle ? (
        <TextField
          size="small"
          label={t('format.title')}
          placeholder={t('format.titlePlaceholder')}
          value={values.title}
          onChange={(event) =>
            onChange({ ...values, title: event.target.value })
          }
          disabled={disabled}
          sx={{ flex: 1, minWidth: 200 }}
        />
      ) : null}
    </Stack>
  );
}
