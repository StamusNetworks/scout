import { useGlobalQueryParams } from '@/features/query-filters/hooks/use-global-query-params';
import { useQFBuilder } from '@/features/query-filters/hooks/use-qf-builder';
import { useGetRulesQuery } from '@/features/rules';

interface UseFamilyDetectionMethodsParams {
  familyId: string;
  page: number;
  pageSize: number;
  ordering?: string;
}

export const useFamilyDetectionMethods = ({
  familyId,
  page,
  pageSize,
  ordering,
}: UseFamilyDetectionMethodsParams) => {
  const QFBuilder = useQFBuilder();
  const params = useGlobalQueryParams(['tenant', 'dates']);
  return useGetRulesQuery(
    {
      ...params,
      page,
      pageSize,
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
