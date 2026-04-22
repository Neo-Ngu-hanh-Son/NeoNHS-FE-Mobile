import { apiClient } from './client';
import { SupportedLanguage } from '@/lib/i18n';

export const translationApi = {
  translateBatch: async (
    fields: Record<string, string>,
    targetLang: SupportedLanguage
  ): Promise<Record<string, string>> => {
    if (targetLang === 'vi') return fields;
    const { data } = await apiClient.post<{ translations: Record<string, string> }>(
      '/translate/batch',
      { targetLang, fields }
    );
    return data?.translations || fields;
  },
};
