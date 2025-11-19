import { useGlobalQueryParams } from '@/common/fetching/useQueryParams';

import { useGetSightingEventsQuery } from '../api/sightings.api';

export const useGetSightingById = (sightingId: string) => {
  const params = useGlobalQueryParams(['dates', 'tenant']);
  return useGetSightingEventsQuery(
    {
      ...params,
      qfilter: `_id:${sightingId}`,
    },
    {
      selectFromResult: (result) => ({
        ...result,
        data: result.data?.results[0],
      }),
    },
  );
};
