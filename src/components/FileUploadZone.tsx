import { useCallback } from 'react';
import { useDropzone, type Accept } from 'react-dropzone';
import { Box, Button, Stack, Typography } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { useTranslation } from 'react-i18next';

interface FileUploadZoneProps {
  accept?: Accept;
  file: File | null;
  onFileChange: (file: File | null) => void;
  disabled?: boolean;
  translationNamespace?: string;
  hintKey?: string;
  dropIdleKey?: string;
  dropActiveKey?: string;
  browseKey?: string;
  selectedKey?: string;
  clearKey?: string;
}

const DEFAULT_ACCEPT: Accept = {
  'text/csv': ['.csv'],
  'application/vnd.ms-excel': ['.csv'],
};

export function FileUploadZone({
  accept = DEFAULT_ACCEPT,
  file,
  onFileChange,
  disabled = false,
  translationNamespace = 'imports',
  hintKey = 'upload.hint',
  dropIdleKey = 'upload.dropIdle',
  dropActiveKey = 'upload.dropActive',
  browseKey = 'upload.browse',
  selectedKey = 'upload.selected',
  clearKey = 'upload.clear',
}: FileUploadZoneProps) {
  const { t } = useTranslation(translationNamespace);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      onFileChange(acceptedFiles[0] ?? null);
    },
    [onFileChange],
  );

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    accept,
    maxFiles: 1,
    multiple: false,
    disabled,
    noClick: true,
    noKeyboard: true,
  });

  return (
    <Stack spacing={1}>
      <Box
        {...getRootProps()}
        sx={{
          border: 2,
          borderStyle: 'dashed',
          borderColor: isDragActive ? 'primary.main' : 'divider',
          borderRadius: 1,
          p: 4,
          textAlign: 'center',
          bgcolor: isDragActive ? 'action.hover' : 'background.paper',
          opacity: disabled ? 0.6 : 1,
        }}
      >
        <input {...getInputProps()} />
        <CloudUploadIcon color="action" sx={{ fontSize: 40, mb: 1 }} />
        <Typography variant="body1" gutterBottom>
          {isDragActive ? t(dropActiveKey) : t(dropIdleKey)}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {t(hintKey)}
        </Typography>
        <Button variant="outlined" onClick={open} disabled={disabled}>
          {t(browseKey)}
        </Button>
      </Box>
      {file ? (
        <Stack direction="row" spacing={1} alignItems="center">
          <Typography variant="body2">
            {t(selectedKey, { name: file.name })}
          </Typography>
          <Button
            size="small"
            onClick={() => onFileChange(null)}
            disabled={disabled}
          >
            {t(clearKey)}
          </Button>
        </Stack>
      ) : null}
    </Stack>
  );
}
