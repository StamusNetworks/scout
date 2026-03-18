import { Dates } from '@/common/fetching/fetching.types';
import { useGlobalQueryParams } from '@/common/fetching/useQueryParams';
import { useGetEventsCountQuery } from '@/features/events/common/events.api';

export const useEventsCount = (dates?: Dates) => {
  const params = useGlobalQueryParams(['tenant', 'dates']);
  return useGetEventsCountQuery({
    ...params,
    ...(dates && {
      start_date: dates.start_date,
      end_date: dates.end_date,
    }),
    discovery: true,
    alert: true,
    stamus: true,
  });
};
