import { Dates } from '@/common/fetching/fetching.types';
import { useGlobalQueryParams } from '@/features/query-filters/hooks/use-global-query-params';

import { useGetGlobalStatsQuery } from '../dashboard.api';

export const useGlobalStats = (dates?: Dates) => {
  const params = useGlobalQueryParams(['tenant', 'dates']);
  return useGetGlobalStatsQuery({
    ...params,
    ...(dates && {
      start_date: dates.start_date,
      end_date: dates.end_date,
    }),
  });
};
