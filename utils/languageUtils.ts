import { SupportedLanguage } from '@/lib/i18n';

// Expo Speech requires BCP 47 language tags (Language-Region)
export const SPEECH_LANGUAGE_MAP: Record<SupportedLanguage, string> = {
  vi: 'vi-VN', // Vietnamese (Vietnam)
  en: 'en-US', // English (United States)
  ja: 'ja-JP', // Japanese (Japan)
  ko: 'ko-KR', // Korean (South Korea)
};
