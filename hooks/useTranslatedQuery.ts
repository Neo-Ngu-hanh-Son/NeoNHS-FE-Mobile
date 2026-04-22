import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { useLanguage } from '@/app/providers/LanguageProvider';
import { translationApi } from '@/services/api/translationApi';

interface Options<T> {
  queryKey: unknown[];
  queryFn: () => Promise<T>;
  extractTranslatableFields: (data: T) => Record<string, string>;
  mergeTranslatedFields: (data: T, translated: Record<string, string>) => T;
  enabled?: boolean;
}

export function useTranslatedQuery<T>({
  queryKey, queryFn, extractTranslatableFields, mergeTranslatedFields, enabled
}: Options<T>) {
  const { language } = useLanguage();

  return useQuery({
    queryKey: [...queryKey, language],  // Cache riêng theo ngôn ngữ
    queryFn: async () => {
      const data = await queryFn();
      if (language === 'vi') return data;

      const fields = extractTranslatableFields(data);
      const translated = await translationApi.translateBatch(fields, language);
      return mergeTranslatedFields(data, translated);
    },
    staleTime: 24 * 60 * 60 * 1000, // 24h cache
    enabled,
  });
}
