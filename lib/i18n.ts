import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { getLocales } from 'expo-localization';

import vi from '@/locales/vi.json';
import en from '@/locales/en.json';
import ja from '@/locales/ja.json';
import ko from '@/locales/ko.json';

export type SupportedLanguage = 'vi' | 'en' | 'ja' | 'ko';
export const SUPPORTED_LANGUAGES: SupportedLanguage[] = ['vi', 'en', 'ja', 'ko'];

const systemLang = getLocales()[0]?.languageCode ?? 'vi';
const defaultLang: SupportedLanguage = SUPPORTED_LANGUAGES.includes(systemLang as SupportedLanguage)
  ? (systemLang as SupportedLanguage)
  : 'vi';

i18n.use(initReactI18next).init({
  resources: {
    vi: { translation: vi },
    en: { translation: en },
    ja: { translation: ja },
    ko: { translation: ko },
  },
  lng: defaultLang,
  fallbackLng: 'vi',
  interpolation: { escapeValue: false },
});

export default i18n;
