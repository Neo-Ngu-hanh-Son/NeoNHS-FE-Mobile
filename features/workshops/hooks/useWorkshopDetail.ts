import { useTranslatedQuery } from '@/hooks/useTranslatedQuery';
import { workshopService } from '../services/workshopService';
import type { WorkshopTemplateResponse } from '../types';

export function useWorkshopDetail(workshopId: string) {
  return useTranslatedQuery<WorkshopTemplateResponse>({
    queryKey: ['workshop-detail', workshopId],
    queryFn: async () => {
      const response = await workshopService.getTemplateById(workshopId);
      return response.data;
    },
    extractTranslatableFields: (data) => {
      const fields: Record<string, string> = {};
      if (data.name) fields.name = data.name;
      if (data.shortDescription) fields.shortDescription = data.shortDescription;
      if (data.fullDescription) fields.fullDescription = data.fullDescription;
      if (data.vendorName) fields.vendorName = data.vendorName;
      
      data.tags?.forEach((tag, idx) => {
        if (tag.name) fields[`tag_${idx}_name`] = tag.name;
        if (tag.description) fields[`tag_${idx}_description`] = tag.description;
      });
      return fields;
    },
    mergeTranslatedFields: (data, translated) => {
      const merged = {
        ...data,
        name: translated.name ?? data.name,
        shortDescription: translated.shortDescription ?? data.shortDescription,
        fullDescription: translated.fullDescription ?? data.fullDescription,
        vendorName: translated.vendorName ?? data.vendorName,
      };
      
      if (data.tags && data.tags.length > 0) {
        merged.tags = data.tags.map((tag, idx) => ({
          ...tag,
          name: translated[`tag_${idx}_name`] ?? tag.name,
          description: translated[`tag_${idx}_description`] ?? tag.description,
        }));
      }
      
      return merged;
    },
  });
}
