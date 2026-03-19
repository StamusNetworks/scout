import { useGlobalQueryParams } from '@/common/fetching/useQueryParams';
import { QueryFilterState } from '@/features/filtering/filters/query-filters/query-filter.model';

import { useGetCountsTimelineQuery } from '../timeline.api';

export const useTimeline = (
  target?: boolean,
  options?: { extendQfilter?: QueryFilterState[] },
) => {
  const params = useGlobalQueryParams(
    ['tenant', 'qfilter', 'dates', 'qfilterHost'],
    {
      extendQfilter: options?.extendQfilter,
    },
  );

  return useGetCountsTimelineQuery({
    ...params,
    target: Boolean(target).toString(),
  });
};
