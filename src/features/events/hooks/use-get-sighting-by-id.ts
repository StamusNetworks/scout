import { esEscape } from '@/common/lib/strings';
import { useGlobalQueryParams } from '@/features/query-filters/hooks/use-global-query-params';

import { useGetSightingEventsQuery } from '../api/events.api';

export const useGetSightingById = (sightingId: string) => {
  const params = useGlobalQueryParams(['dates', 'tenant']);
  return useGetSightingEventsQuery(
    {
      ...params,
      qfilter: `_id:${esEscape(sightingId)}`,
    },
    {
      selectFromResult: (result) => ({
        ...result,
        data: result.data?.results[0],
      }),
    },
  );
};
