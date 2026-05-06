import { DateRange } from '@/common/fetching/fetching.types';
import { useGlobalQueryParams } from '@/features/query-filters/hooks/use-global-query-params';

import { useGetGlobalStatsQuery } from '../api/dashboard.api';

export const useGlobalStats = (dates?: DateRange) => {
  const params = useGlobalQueryParams(['tenant', 'dates']);
  return useGetGlobalStatsQuery({
    ...params,
    ...(dates && {
      from: dates.from,
      to: dates.to,
    }),
  });
};
