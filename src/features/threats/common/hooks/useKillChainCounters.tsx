import { useGlobalQueryParams } from '@/features/query-filters/hooks/use-global-query-params';

import { useGetKillChainCountersQuery } from '../../api/entities.api';

export const useKillChainCounters = () => {
  const params = useGlobalQueryParams(['dates', 'tenant']);
  return useGetKillChainCountersQuery(params);
};
