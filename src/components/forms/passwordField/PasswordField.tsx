import { forwardRef, useState } from 'react';
import {
  IconButton,
  InputAdornment,
  TextField,
  type TextFieldProps,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { useTranslation } from 'react-i18next';

export type PasswordFieldProps = Omit<TextFieldProps, 'type'>;

export const PasswordField = forwardRef<HTMLInputElement, PasswordFieldProps>(
  function PasswordField({ slotProps, ...props }, ref) {
    const { t } = useTranslation('auth');
    const [showPassword, setShowPassword] = useState(false);

    return (
      <TextField
        {...props}
        ref={ref}
        type={showPassword ? 'text' : 'password'}
        slotProps={{
          ...slotProps,
          input: {
            ...slotProps?.input,
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  aria-label={
                    showPassword ? t('hidePassword') : t('showPassword')
                  }
                  onClick={() => setShowPassword((current) => !current)}
                  onMouseDown={(event) => event.preventDefault()}
                  edge="end"
                >
                  {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                </IconButton>
              </InputAdornment>
            ),
          },
        }}
      />
    );
  },
);
