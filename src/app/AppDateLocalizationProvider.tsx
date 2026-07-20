import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import 'dayjs/locale/ru';
import 'dayjs/locale/zh-cn';
import { useEffect, useMemo, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import { normalizeUiLocale } from '@/lib/supportedLocales';

function getDayjsLocale(language: string): string {
  switch (normalizeUiLocale(language)) {
    case 'ru':
      return 'ru';
    case 'zh':
      return 'zh-cn';
    default:
      return 'en';
  }
}

interface AppDateLocalizationProviderProps {
  children: ReactNode;
}

export function AppDateLocalizationProvider({
  children,
}: AppDateLocalizationProviderProps) {
  const { i18n } = useTranslation();
  const adapterLocale = useMemo(
    () => getDayjsLocale(i18n.language),
    [i18n.language],
  );

  useEffect(() => {
    dayjs.locale(adapterLocale);
  }, [adapterLocale]);

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale={adapterLocale}>
      {children}
    </LocalizationProvider>
  );
}
