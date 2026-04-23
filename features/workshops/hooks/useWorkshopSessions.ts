import { useTranslatedQuery } from '@/hooks/useTranslatedQuery';
import { workshopService } from '../services/workshopService';
import type { WorkshopSessionResponse } from '../types';

export function useWorkshopSessions(workshopId: string, enabled = true) {
  return useTranslatedQuery<WorkshopSessionResponse[]>({
    queryKey: ['workshop-sessions', workshopId],
    queryFn: async () => {
      const response = await workshopService.getSessions(workshopId);
      return response.data.content;
    },
    enabled: !!workshopId && enabled,
    extractTranslatableFields: (data) => {
      const fields: Record<string, string> = {};
      data.forEach((item, idx) => {
        if (item.name) fields[`item_${idx}_name`] = item.name;
        if (item.shortDescription) fields[`item_${idx}_shortDescription`] = item.shortDescription;
        if (item.vendorName) fields[`item_${idx}_vendorName`] = item.vendorName;
        
        item.tags?.forEach((tag, tagIdx) => {
          if (tag.name) fields[`item_${idx}_tag_${tagIdx}_name`] = tag.name;
        });
      });
      return fields;
    },
    mergeTranslatedFields: (data, translated) => {
      return data.map((item, idx) => {
        const mergedItem = {
          ...item,
          name: translated[`item_${idx}_name`] ?? item.name,
          shortDescription: translated[`item_${idx}_shortDescription`] ?? item.shortDescription,
          vendorName: translated[`item_${idx}_vendorName`] ?? item.vendorName,
        };
        
        if (item.tags) {
          mergedItem.tags = item.tags.map((tag, tagIdx) => ({
            ...tag,
            name: translated[`item_${idx}_tag_${tagIdx}_name`] ?? tag.name,
          }));
        }
        
        return mergedItem;
      });
    },
  });
}
