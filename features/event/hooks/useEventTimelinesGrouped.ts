import { useTranslatedQuery } from '@/hooks/useTranslatedQuery';
import { eventService } from '../services/eventService';
import { normalizeEventTimelineGroups } from '../utils/helpers';
import type { EventTimelinesGroupedResponse } from '../types';

export function useEventTimelinesGrouped(eventId: string, enabled = true) {
  return useTranslatedQuery<EventTimelinesGroupedResponse>({
    queryKey: ['event-timelines-grouped', eventId],
    queryFn: async () => {
      const response = await eventService.getEventTimelinesGrouped(eventId);
      return normalizeEventTimelineGroups(response.data);
    },
    enabled: !!eventId && enabled,
    extractTranslatableFields: (data) => {
      const fields: Record<string, string> = {};
      data.forEach((group, gIdx) => {
        if (group.dayLabel) fields[`g_${gIdx}_dayLabel`] = group.dayLabel;
        
        group.timelines.forEach((img, tIdx) => {
          if (img.name) fields[`g_${gIdx}_t_${tIdx}_name`] = img.name;
          if (img.description) fields[`g_${gIdx}_t_${tIdx}_desc`] = img.description;
          if (img.organizer) fields[`g_${gIdx}_t_${tIdx}_org`] = img.organizer;
          if (img.coOrganizer) fields[`g_${gIdx}_t_${tIdx}_coOrg`] = img.coOrganizer;
          
          if (img.eventPoint) {
            const ep = img.eventPoint;
            if (ep.name) fields[`g_${gIdx}_t_${tIdx}_ep_name`] = ep.name;
            if (ep.description) fields[`g_${gIdx}_t_${tIdx}_ep_desc`] = ep.description;
            if (ep.address) fields[`g_${gIdx}_t_${tIdx}_ep_addr`] = ep.address;
            
            if (ep.eventPointTag?.name) {
              fields[`g_${gIdx}_t_${tIdx}_ep_tag_name`] = ep.eventPointTag.name;
            }
          }
        });
      });
      return fields;
    },
    mergeTranslatedFields: (data, translated) => {
      return data.map((group, gIdx) => {
        const mergedGroup = {
          ...group,
          dayLabel: translated[`g_${gIdx}_dayLabel`] ?? group.dayLabel,
        };
        
        mergedGroup.timelines = group.timelines.map((img, tIdx) => {
          const mergedTimeline = {
            ...img,
            name: translated[`g_${gIdx}_t_${tIdx}_name`] ?? img.name,
            description: translated[`g_${gIdx}_t_${tIdx}_desc`] ?? img.description,
            organizer: translated[`g_${gIdx}_t_${tIdx}_org`] ?? img.organizer,
            coOrganizer: translated[`g_${gIdx}_t_${tIdx}_coOrg`] ?? img.coOrganizer,
          };
          
          if (img.eventPoint) {
            const ep = img.eventPoint;
            mergedTimeline.eventPoint = {
              ...ep,
              name: translated[`g_${gIdx}_t_${tIdx}_ep_name`] ?? ep.name,
              description: translated[`g_${gIdx}_t_${tIdx}_ep_desc`] ?? ep.description,
              address: translated[`g_${gIdx}_t_${tIdx}_ep_addr`] ?? ep.address,
            };
            
            if (ep.eventPointTag) {
              mergedTimeline.eventPoint.eventPointTag = {
                ...ep.eventPointTag,
                name: translated[`g_${gIdx}_t_${tIdx}_ep_tag_name`] ?? ep.eventPointTag.name,
              };
            }
          }
          return mergedTimeline;
        });
        
        return mergedGroup;
      });
    },
  });
}
