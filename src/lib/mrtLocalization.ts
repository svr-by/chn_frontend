import type { MRT_Localization } from 'material-react-table';
import { MRT_Localization_EN } from 'material-react-table/locales/en';
import { MRT_Localization_RU } from 'material-react-table/locales/ru';
import { MRT_Localization_ZH_HANS } from 'material-react-table/locales/zh-Hans';

const MRT_LOCALIZATION_BY_LANG: Record<string, MRT_Localization> = {
  en: MRT_Localization_EN,
  ru: MRT_Localization_RU,
  zh: MRT_Localization_ZH_HANS,
};

export function getMrtLocalization(language: string): MRT_Localization {
  const normalized = language.split('-')[0]?.toLowerCase() ?? 'en';
  return MRT_LOCALIZATION_BY_LANG[normalized] ?? MRT_Localization_EN;
}
