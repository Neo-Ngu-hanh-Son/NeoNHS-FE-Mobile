import { useTranslatedQuery } from '@/hooks/useTranslatedQuery';
import { discoverService } from '../services/discoverServices';

export function usePointsByAttraction(attractionId?: string) {
  return useTranslatedQuery({
    queryKey: ['points-by-attraction', attractionId],
    queryFn: async () => {
      const response = await discoverService.getPointsByAttraction(attractionId!);
      return response.data;
    },
    extractTranslatableFields: (points: any[]) => {
      const fields: Record<string, string> = {};
      points.forEach(point => {
        if (point.name) fields[`point_${point.id}_name`] = point.name;
        if (point.description) fields[`point_${point.id}_desc`] = point.description;
        if (point.address) fields[`point_${point.id}_address`] = point.address;
      });
      return fields;
    },
    mergeTranslatedFields: (points: any[], translated) => {
      return points.map(point => ({
        ...point,
        name: translated[`point_${point.id}_name`] || point.name,
        description: translated[`point_${point.id}_desc`] || point.description,
        address: translated[`point_${point.id}_address`] || point.address,
      }));
    },
    enabled: !!attractionId,
  });
}
