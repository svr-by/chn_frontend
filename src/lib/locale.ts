import type { PostAuthForgotPasswordBodyLocale } from '@/api/generated/models/postAuthForgotPasswordBodyLocale';

export function getApiLocale(): PostAuthForgotPasswordBodyLocale {
  const lang =
    typeof window !== 'undefined'
      ? (localStorage.getItem('chn_locale') ??
          document.documentElement.lang ??
          'en')
      : 'en';

  return lang.startsWith('ru') ? 'ru' : 'en';
}
