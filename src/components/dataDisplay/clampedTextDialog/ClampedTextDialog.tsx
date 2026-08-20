import type { ReactNode } from 'react';
import { useMemo, useState } from 'react';
import {
  Button,
  ButtonBase,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Typography,
} from '@mui/material';

export type ClampedTextDialogProps = {
  text: string | null | undefined;
  title: ReactNode;
  closeLabel: string;
  icon?: ReactNode;
  previewLines?: number;
  emptyText?: ReactNode;
};

export function ClampedTextDialog({
  text,
  title,
  closeLabel,
  icon,
  previewLines = 1,
  emptyText = '—',
}: ClampedTextDialogProps) {
  const [open, setOpen] = useState(false);

  const resolvedText = useMemo(() => text?.trim() ?? '', [text]);
  const hasText = resolvedText.length > 0;

  const clampSx = useMemo(
    () => ({
      display: '-webkit-box',
      WebkitBoxOrient: 'vertical',
      WebkitLineClamp: previewLines,
      overflow: 'hidden',
      lineHeight: 1.4,
      maxWidth: 320,
      textOverflow: 'ellipsis',
      textAlign: 'left',
    }),
    [previewLines],
  );

  if (!hasText) {
    return <>{emptyText}</>;
  }

  return (
    <>
      <ButtonBase
        onClick={() => setOpen(true)}
        sx={{ width: '100%', textAlign: 'left' }}
      >
        <Stack
          direction="row"
          spacing={icon ? 1 : 0}
          alignItems="flex-start"
          sx={{ width: '100%' }}
        >
          {icon ? icon : null}
          <Typography variant="body2" sx={clampSx}>
            {resolvedText}
          </Typography>
        </Stack>
      </ButtonBase>

      {open ? (
        <Dialog
          open={open}
          onClose={() => setOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>{title}</DialogTitle>
          <DialogContent>
            <Typography
              variant="body2"
              sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
            >
              {resolvedText}
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpen(false)}>{closeLabel}</Button>
          </DialogActions>
        </Dialog>
      ) : null}
    </>
  );
}

