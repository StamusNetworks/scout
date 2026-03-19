import { QueryFilterState } from '@/features/filtering/filters/query-filters/query-filter.model';
import { useGlobalQueryParams } from '@/features/filtering/use-global-query-params';

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
