import { useGlobalQueryParams } from '@/common/fetching/useQueryParams';

import { useGetKillChainCountersQuery } from '../entities.api';

export const useKillChainCounters = () => {
  const params = useGlobalQueryParams(['dates', 'tenant']);
  return useGetKillChainCountersQuery(params);
};
