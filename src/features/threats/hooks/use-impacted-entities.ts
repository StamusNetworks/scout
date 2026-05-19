import { useGlobalQueryParams } from '@/features/query-filters/hooks/use-global-query-params';

import { useGetImpactedEntitiesQuery } from '../api/entities.api';

interface UseImpactedEntitiesParams {
  page: number;
  pageSize: number;
}

export const useImpactedEntities = ({
  page,
  pageSize,
}: UseImpactedEntitiesParams) => {
  const params = useGlobalQueryParams(['dates', 'tenant']);
  return useGetImpactedEntitiesQuery({
    ...params,
    page,
    pageSize,
  });
};
