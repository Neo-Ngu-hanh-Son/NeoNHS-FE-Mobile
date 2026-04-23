import { homeService } from '../services/homeService';
import { useTranslatedQuery } from '@/hooks/useTranslatedQuery';
import type { BlogResponse } from '@/features/blog/types';

export default function useGuides() {
  return useTranslatedQuery<BlogResponse[]>({
    queryKey: ['home-guides'],
    queryFn: async () => {
      const result = await homeService.getKnowBeforeYouGo();
      return result.content;
    },
    extractTranslatableFields: (guides) => {
      const fields: Record<string, string> = {};
      guides.forEach(guide => {
        if (guide.title) fields[`guide_${guide.id}_title`] = guide.title;
        if (guide.summary) fields[`guide_${guide.id}_summary`] = guide.summary;
      });
      return fields;
    },
    mergeTranslatedFields: (guides, translated) => {
      return guides.map(guide => ({
        ...guide,
        title: translated[`guide_${guide.id}_title`] || guide.title,
        summary: translated[`guide_${guide.id}_summary`] || guide.summary,
      }));
    }
  });
}
