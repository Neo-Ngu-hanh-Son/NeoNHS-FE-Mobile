import { useQuery } from '@tanstack/react-query';
import { discoverService } from '../services/discoverServices';
import { useLanguage } from '@/app/providers/LanguageProvider';
import { translationApi } from '@/services/api/translationApi';

export function useAttractions(search: string) {
  const { language } = useLanguage();

  return useQuery({
    queryKey: ['attractions', search, language],
    queryFn: async () => {
      const response = await discoverService.getAllAttractionsWithPointPaginated({
        search: search,
        page: 0,
        size: 100,
        sortBy: 'id',
        sortDir: 'asc'
      });
      let content = response.data.content;

      if (language !== 'vi' && content && content.length > 0) {
        const fieldsToTranslate: Record<string, string> = {};
        content.forEach((attr: any) => {
          if (attr.name) fieldsToTranslate[`attr_${attr.id}_name`] = attr.name;
          if (attr.description) fieldsToTranslate[`attr_${attr.id}_desc`] = attr.description;
          
          if (attr.points && Array.isArray(attr.points)) {
            attr.points.forEach((point: any) => {
              if (point.name) fieldsToTranslate[`point_${point.id}_name`] = point.name;
              if (point.description) fieldsToTranslate[`point_${point.id}_desc`] = point.description;
            });
          }
        });

        if (Object.keys(fieldsToTranslate).length > 0) {
          const translatedFields = await translationApi.translateBatch(fieldsToTranslate, language);
          content = content.map((attr: any) => ({
            ...attr,
            name: translatedFields[`attr_${attr.id}_name`] || attr.name,
            description: translatedFields[`attr_${attr.id}_desc`] || attr.description,
            points: attr.points?.map((point: any) => ({
              ...point,
              name: translatedFields[`point_${point.id}_name`] || point.name,
              description: translatedFields[`point_${point.id}_desc`] || point.description,
            }))
          }));
        }
      }

      return content;
    },
    enabled: true,
  });
}
