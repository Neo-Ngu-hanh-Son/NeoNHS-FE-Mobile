import { useWorkshopSearch } from '@/features/workshops/hooks/useWorkshopSearch';

export default function useHomeWorkshops() {
  const workshopSearch = useWorkshopSearch({
    size: 5,
    sortBy: 'createdAt',
    sortDir: 'desc',
  });

  return {
    ...workshopSearch,
    data: workshopSearch.data?.pages?.[0]?.content ?? [],
  };
}
