import { useTranslatedQuery } from '@/hooks/useTranslatedQuery';
import { workshopService } from '../services/workshopService';
import type { WorkshopTagResponse } from '../types';

/**
 * Fetch all workshop tags (GET /api/wtags/all).
 * Tags are relatively static so we use a 5-minute staleTime.
 */
export function useWorkshopTags() {
  return useTranslatedQuery<WorkshopTagResponse[]>({
    queryKey: ['workshop-tags'],
    queryFn: async () => {
      const response = await workshopService.getAllTags();
      return response.data;
    },
    extractTranslatableFields: (data) => {
      const fields: Record<string, string> = {};
      data.forEach((tag, idx) => {
        if (tag.name) fields[`tag_${idx}_name`] = tag.name;
        if (tag.description) fields[`tag_${idx}_description`] = tag.description;
      });
      return fields;
    },
    mergeTranslatedFields: (data, translated) => {
      return data.map((tag, idx) => ({
        ...tag,
        name: translated[`tag_${idx}_name`] ?? tag.name,
        description: translated[`tag_${idx}_description`] ?? tag.description,
      }));
    },
    // staleTime handled by useTranslatedQuery or could override if we modified it
  });
}
