import { useGlobalQueryParams } from '@/features/query-filters/hooks/use-global-query-params';
import { QueryFilterState } from '@/features/query-filters/model/query-filter';

import { useGetCountsTimelineQuery } from './counts-timeline.api';

/**
 * Returns the IDS-event counts timeline scoped to the current global
 * query params (tenant, qfilter, dates, host qfilter). `target` toggles
 * victim-vs-offender perspective at the wire.
 */
export const useCountsTimeline = (
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
