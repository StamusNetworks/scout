import { PaginationState } from '@tanstack/react-table';

import { useGlobalQueryParams } from '@/features/query-filters/hooks/use-global-query-params';

import { useGetImpactedEntitiesQuery } from '../entities.api';

export const useImpactedEntities = (pagination: PaginationState) => {
  const params = useGlobalQueryParams(['dates', 'tenant']);
  return useGetImpactedEntitiesQuery({
    ...params,
    ...pagination,
  });
};
