import { homeService } from '../services/homeService';
import { useTranslatedQuery } from '@/hooks/useTranslatedQuery';
import type { BlogResponse } from '@/features/blog/types';

export default function useOverviews() {
  return useTranslatedQuery<BlogResponse[]>({
    queryKey: ['home-overviews'],
    queryFn: async () => {
      const result = await homeService.getAboutNHS();
      return result.content;
    },
    extractTranslatableFields: (overviews) => {
      const fields: Record<string, string> = {};
      overviews.forEach(overview => {
        if (overview.title) fields[`overview_${overview.id}_title`] = overview.title;
        if (overview.summary) fields[`overview_${overview.id}_summary`] = overview.summary;
      });
      return fields;
    },
    mergeTranslatedFields: (overviews, translated) => {
      return overviews.map(overview => ({
        ...overview,
        title: translated[`overview_${overview.id}_title`] || overview.title,
        summary: translated[`overview_${overview.id}_summary`] || overview.summary,
      }));
    }
  });
}
