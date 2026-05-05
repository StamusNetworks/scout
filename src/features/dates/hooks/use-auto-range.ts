// Cross-feature import via legacy path; will move through query-filters'
// public barrel once that context migrates.
import { selectEventTypeFlagsParams } from '@/features/filtering/filters/query-filters/query-filters.selectors';
import { useTenant } from '@/features/tenancy';
import { useAppSelector } from '@/store/store';

import { useGetAutoDateRangeQuery } from '../api/dates.api';

/**
 * Fetches the appliance-derived "auto" date window — the min/max
 * timestamps of available alerts for the current tenant + event-type
 * filters. The dates slice listens to this query's fulfilled action
 * and updates `state.start_date`/`end_date` when the active mode is
 * `auto`.
 */
export const useAutoRange = () => {
  const params = useAppSelector(selectEventTypeFlagsParams);
  const tenant = useTenant();
  return useGetAutoDateRangeQuery(
    { ...params, tenant },
    { refetchOnMountOrArgChange: true },
  );
};
