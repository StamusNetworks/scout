import { useDates } from '@/features/dates';
import { useGlobalQueryParams } from '@/features/query-filters/hooks/use-global-query-params';

import {
  getAggregationBody,
  getCustomFilter,
  useFetchHostsCountsQuery,
} from '../api/hosts.api';

export const useFetchHostsCounts = ({
  inHomeNetwork,
}: {
  inHomeNetwork: 'true' | 'false' | 'all';
}) => {
  const dateFilters = useDates();
  const { tenant, from, to } = useGlobalQueryParams(['tenant', 'dates']);
  const customFilter =
    dateFilters.type === 'range' || dateFilters.type === 'auto'
      ? getCustomFilter(from!, to!)
      : undefined;
  const agg = getAggregationBody(tenant, inHomeNetwork, customFilter);

  return useFetchHostsCountsQuery({
    body: agg,
    from,
    to,
    tenant,
  });
};
