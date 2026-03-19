import { PaginationState } from '@tanstack/react-table';

import { useGlobalQueryParams } from '@/common/fetching/useQueryParams';
import { useGetSignaturesQuery } from '@/features/detection-methods/signatures/api/signatures.api';
import { useQFBuilder } from '@/features/filtering/filters/query-filters/hooks/use-qf-builder';

interface UseFamilyDetectionMethodsParams {
  familyId: string;
  pagination: PaginationState;
  ordering?: string;
}

export const useFamilyDetectionMethods = ({
  familyId,
  pagination,
  ordering,
}: UseFamilyDetectionMethodsParams) => {
  const QFBuilder = useQFBuilder();
  const params = useGlobalQueryParams(['tenant', 'dates']);
  return useGetSignaturesQuery(
    {
      ...params,
      ...pagination,
      hits_min: 1,
      alert: true,
      stamus: true,
      discovery: true,
      ordering: ordering ?? '-hits',
      qfilter: QFBuilder.toQFString(
        [QFBuilder.createFilter('stamus.family_id', familyId!)],
        {
          untagged: true,
          informational: true,
          relevant: true,
        },
      ),
    },
    {
      skip: !familyId,
    },
  );
};
