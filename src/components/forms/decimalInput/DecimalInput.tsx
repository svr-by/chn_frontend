import { TextField, type TextFieldProps } from '@mui/material';

import { isValidDecimal } from '@/lib/decimal';

interface DecimalInputProps extends Omit<TextFieldProps, 'value' | 'onChange'> {
  value: string;
  onChange: (value: string) => void;
}

export function DecimalInput({
  value,
  onChange,
  error,
  helperText,
  onBlur,
  ...props
}: DecimalInputProps) {
  const showError =
    Boolean(error) || (value.trim() !== '' && !isValidDecimal(value));

  const validationMessage =
    value.trim() !== '' && !isValidDecimal(value)
      ? 'Enter a valid number (up to 4 decimal places)'
      : helperText;

  return (
    <TextField
      {...props}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      onBlur={onBlur}
      error={showError}
      helperText={validationMessage}
      inputProps={{
        inputMode: 'decimal',
        ...props.inputProps,
      }}
    />
  );
}
