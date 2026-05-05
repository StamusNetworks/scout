import { Dates } from '@/common/fetching/fetching.types';
import { useGlobalQueryParams } from '@/features/query-filters/hooks/use-global-query-params';

import { useGetEventsCountQuery } from '../api/events.api';

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
