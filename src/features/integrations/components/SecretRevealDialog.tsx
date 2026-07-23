import { useState } from 'react';
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { useTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';

interface SecretRevealDialogProps {
  open: boolean;
  title: string;
  secret: string;
  onClose: () => void;
}

export function SecretRevealDialog({
  open,
  title,
  secret,
  onClose,
}: SecretRevealDialogProps) {
  const { t } = useTranslation('integrations');
  const { enqueueSnackbar } = useSnackbar();
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(secret);
      setCopied(true);
      enqueueSnackbar(t('secretReveal.copied'), { variant: 'success' });
    } catch {
      enqueueSnackbar(t('secretReveal.copyFailed'), { variant: 'error' });
    }
  }

  function handleClose() {
    setCopied(false);
    onClose();
  }

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <Alert severity="warning" sx={{ mb: 2 }}>
          {t('secretReveal.warning')}
        </Alert>
        <TextField
          value={secret}
          fullWidth
          multiline
          minRows={2}
          InputProps={{
            readOnly: true,
            sx: { fontFamily: 'monospace', fontSize: '0.875rem' },
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  aria-label={t('secretReveal.copy')}
                  onClick={() => void handleCopy()}
                  edge="end"
                >
                  <ContentCopyIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
        {copied ? (
          <Typography
            variant="caption"
            color="success.main"
            sx={{ mt: 1, display: 'block' }}
          >
            {t('secretReveal.copiedHint')}
          </Typography>
        ) : null}
      </DialogContent>
      <DialogActions>
        <Button variant="contained" onClick={handleClose}>
          {t('secretReveal.dismiss')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
