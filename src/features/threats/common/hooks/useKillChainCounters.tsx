import { useGlobalQueryParams } from '@/features/filtering/use-global-query-params';

import { useGetKillChainCountersQuery } from '../entities.api';

export const useKillChainCounters = () => {
  const params = useGlobalQueryParams(['dates', 'tenant']);
  return useGetKillChainCountersQuery(params);
};
