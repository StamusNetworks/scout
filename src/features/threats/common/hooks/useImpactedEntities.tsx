import { PaginationState } from '@tanstack/react-table';

import { useGlobalQueryParams } from '@/common/fetching/useQueryParams';

import { useGetImpactedEntitiesQuery } from '../entities.api';

export const useImpactedEntities = (pagination: PaginationState) => {
  const params = useGlobalQueryParams(['dates', 'tenant']);
  return useGetImpactedEntitiesQuery({
    ...params,
    ...pagination,
  });
};
