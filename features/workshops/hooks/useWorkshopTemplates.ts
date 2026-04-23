import { useTranslatedQuery } from '@/hooks/useTranslatedQuery';
import { workshopService } from '../services/workshopService';
import type { WorkshopFilterParams, WorkshopPageResponse, WorkshopTemplateResponse } from '../types';

export function useWorkshopTemplates(params?: WorkshopFilterParams) {
  return useTranslatedQuery<WorkshopPageResponse<WorkshopTemplateResponse>>({
    queryKey: ['workshop-templates', params],
    queryFn: async () => {
      const response = await workshopService.getTemplates(params);
      return response.data;
    },
    extractTranslatableFields: (data) => {
      const fields: Record<string, string> = {};
      data.content.forEach((item, idx) => {
        if (item.name) fields[`item_${idx}_name`] = item.name;
        if (item.shortDescription) fields[`item_${idx}_shortDescription`] = item.shortDescription;
        if (item.vendorName) fields[`item_${idx}_vendorName`] = item.vendorName;
        // Not putting fullDescription here to save bandwidth if it's not shown in list, but let's be thorough
        if (item.fullDescription) fields[`item_${idx}_fullDescription`] = item.fullDescription;
        
        item.tags?.forEach((tag, tagIdx) => {
          if (tag.name) fields[`item_${idx}_tag_${tagIdx}_name`] = tag.name;
        });
      });
      return fields;
    },
    mergeTranslatedFields: (data, translated) => {
      const mergedContent = data.content.map((item, idx) => {
        const mergedItem = {
          ...item,
          name: translated[`item_${idx}_name`] ?? item.name,
          shortDescription: translated[`item_${idx}_shortDescription`] ?? item.shortDescription,
          vendorName: translated[`item_${idx}_vendorName`] ?? item.vendorName,
          fullDescription: translated[`item_${idx}_fullDescription`] ?? item.fullDescription,
        };
        
        if (item.tags) {
          mergedItem.tags = item.tags.map((tag, tagIdx) => ({
            ...tag,
            name: translated[`item_${idx}_tag_${tagIdx}_name`] ?? tag.name,
          }));
        }
        
        return mergedItem;
      });
      
      return {
        ...data,
        content: mergedContent,
      };
    },
  });
}
