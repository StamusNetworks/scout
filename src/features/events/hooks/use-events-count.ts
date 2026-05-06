import { DateRange } from '@/common/fetching/fetching.types';
import { useGlobalQueryParams } from '@/features/query-filters/hooks/use-global-query-params';

import { useGetEventsCountQuery } from '../api/events.api';

export const useEventsCount = (dates?: DateRange) => {
  const params = useGlobalQueryParams(['tenant', 'dates']);
  return useGetEventsCountQuery({
    ...params,
    ...(dates && {
      from: dates.from,
      to: dates.to,
    }),
    discovery: true,
    alert: true,
    stamus: true,
  });
};
