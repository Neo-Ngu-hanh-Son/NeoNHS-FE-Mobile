import { homeService } from '../services/homeService';
import { useQuery } from '@tanstack/react-query';
import { useLanguage } from '@/app/providers/LanguageProvider';
import { translationApi } from '@/services/api/translationApi';

export default function useHomeDestinations() {
  const { language } = useLanguage();

  return useQuery({
    queryKey: ['home-destinations', language],
    queryFn: async () => {
      const result = await homeService.getDestinations();
      let content = result.data.content;

      if (language !== 'vi' && content && content.length > 0) {
        const fieldsToTranslate: Record<string, string> = {};
        content.forEach((dest) => {
          if (dest.name) fieldsToTranslate[`${dest.id}_name`] = dest.name;
        });

        if (Object.keys(fieldsToTranslate).length > 0) {
          const translatedFields = await translationApi.translateBatch(fieldsToTranslate, language);
          content = content.map((dest) => ({
            ...dest,
            name: translatedFields[`${dest.id}_name`] || dest.name,
          }));
        }
      }

      return content;
    },
  });
}
