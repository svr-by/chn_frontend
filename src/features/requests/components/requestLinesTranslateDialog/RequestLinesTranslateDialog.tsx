import { useEffect, useMemo, useState } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';

import { usePreviewTranslateImportMutation } from '@/api/endpoints/importsApi';
import { PostCompaniesCompanyIdImportsRequestLinesTranslatePreviewBodySourceLocale } from '@/api/generated/models/postCompaniesCompanyIdImportsRequestLinesTranslatePreviewBodySourceLocale';
import type { PostCompaniesCompanyIdImportsRequestLinesTranslatePreviewBodyTargetLocale as TargetLocale } from '@/api/generated/models/postCompaniesCompanyIdImportsRequestLinesTranslatePreviewBodyTargetLocale';
import { ApiErrorAlert } from '@/components/ApiErrorAlert';
import {
  applyTranslatedPreviewToDraftLines,
  draftLinesToTranslatePreview,
  type DraftRequestLine,
} from '@/features/requests/lib/draftRequestLine';
import { normalizeUiLocale } from '@/lib/supportedLocales';

type SourceLocale =
  (typeof PostCompaniesCompanyIdImportsRequestLinesTranslatePreviewBodySourceLocale)[keyof typeof PostCompaniesCompanyIdImportsRequestLinesTranslatePreviewBodySourceLocale];

const SOURCE_OPTIONS: SourceLocale[] = ['auto', 'zh', 'ru', 'en'];
const TARGET_OPTIONS: TargetLocale[] = ['zh', 'ru', 'en'];

interface RequestLinesTranslateDialogProps {
  open: boolean;
  onClose: () => void;
  companyId: string;
  lines: DraftRequestLine[];
  onApply: (lines: DraftRequestLine[]) => void;
}

export function RequestLinesTranslateDialog({
  open,
  onClose,
  companyId,
  lines,
  onApply,
}: RequestLinesTranslateDialogProps) {
  const { t, i18n } = useTranslation('requests');
  const { enqueueSnackbar } = useSnackbar();
  const defaultTarget = useMemo(
    () =>
      normalizeUiLocale(i18n.language) as TargetLocale,
    [i18n.language],
  );
  const [sourceLocale, setSourceLocale] = useState<SourceLocale>('auto');
  const [targetLocale, setTargetLocale] = useState<TargetLocale>(defaultTarget);
  const [translatePreview, translateState] = usePreviewTranslateImportMutation();

  useEffect(() => {
    if (!open) {
      return;
    }
    setSourceLocale('auto');
    setTargetLocale(defaultTarget);
  }, [open, defaultTarget]);

  function handleClose() {
    translateState.reset();
    onClose();
  }

  async function handleProcess() {
    try {
      const result = await translatePreview({
        companyId,
        sourceLocale,
        targetLocale,
        preview: draftLinesToTranslatePreview(lines),
      }).unwrap();
      onApply(applyTranslatedPreviewToDraftLines(lines, result.preview));
      enqueueSnackbar(t('toast.translated'), { variant: 'success' });
      handleClose();
    } catch {
      // ApiErrorAlert
    }
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>{t('translate.title')}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1 }}>
          <ApiErrorAlert error={translateState.error} />
          <FormControl fullWidth size="small">
            <InputLabel id="translate-source-locale">
              {t('translate.sourceLocale')}
            </InputLabel>
            <Select
              labelId="translate-source-locale"
              label={t('translate.sourceLocale')}
              value={sourceLocale}
              onChange={(event) =>
                setSourceLocale(event.target.value as SourceLocale)
              }
              disabled={translateState.isLoading}
            >
              {SOURCE_OPTIONS.map((locale) => (
                <MenuItem key={locale} value={locale}>
                  {locale === 'auto'
                    ? t('translate.sourceAuto')
                    : t(`translate.locale.${locale}`)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth size="small">
            <InputLabel id="translate-target-locale">
              {t('translate.targetLocale')}
            </InputLabel>
            <Select
              labelId="translate-target-locale"
              label={t('translate.targetLocale')}
              value={targetLocale}
              onChange={(event) =>
                setTargetLocale(event.target.value as TargetLocale)
              }
              disabled={translateState.isLoading}
            >
              {TARGET_OPTIONS.map((locale) => (
                <MenuItem key={locale} value={locale}>
                  {t(`translate.locale.${locale}`)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={translateState.isLoading}>
          {t('actions.cancel')}
        </Button>
        <Button
          variant="contained"
          onClick={() => void handleProcess()}
          disabled={translateState.isLoading || lines.length === 0}
        >
          {t('actions.processTranslation')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
