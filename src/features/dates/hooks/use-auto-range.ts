import { useEventTypeFlagsParams } from '@/features/query-filters';
import { useTenant } from '@/features/tenancy';

import { useGetAutoDateRangeQuery } from '../api/dates.api';

/**
 * Fetches the appliance-derived "auto" date window — the min/max
 * timestamps of available alerts for the current tenant + event-type
 * filters. The dates slice listens to this query's fulfilled action
 * and updates `state.from`/`to` when the active mode is `auto`.
 */
export const useAutoRange = () => {
  const params = useEventTypeFlagsParams();
  const tenant = useTenant();
  return useGetAutoDateRangeQuery(
    { ...params, tenant },
    { refetchOnMountOrArgChange: true },
  );
};
