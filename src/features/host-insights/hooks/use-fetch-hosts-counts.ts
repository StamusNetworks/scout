import { useDates } from '@/features/dates';
import {
  getAggregationBody,
  getCustomFilter,
  useFetchHostsCountsQuery,
} from '@/features/host-insights/api/hosts.api';
import { useGlobalQueryParams } from '@/features/query-filters/hooks/use-global-query-params';

export const useFetchHostsCounts = ({
  inHomeNetwork,
}: {
  inHomeNetwork: 'true' | 'false' | 'all';
}) => {
  const dateFilters = useDates();
  const { tenant, start_date, end_date } = useGlobalQueryParams([
    'tenant',
    'dates',
  ]);
  const customFilter =
    dateFilters.type === 'range' || dateFilters.type === 'auto'
      ? getCustomFilter(start_date!, end_date!)
      : undefined;
  const agg = getAggregationBody(tenant, inHomeNetwork, customFilter);

  return useFetchHostsCountsQuery({
    body: agg,
    start_date,
    end_date,
    tenant,
  });
};
