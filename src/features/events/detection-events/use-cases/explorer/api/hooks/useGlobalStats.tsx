import { Dates } from '@/common/fetching/fetching.types';
import { useGlobalQueryParams } from '@/common/fetching/useQueryParams';

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
