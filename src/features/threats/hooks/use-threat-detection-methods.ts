import { useGlobalQueryParams } from '@/features/query-filters/hooks/use-global-query-params';
import { useQFBuilder } from '@/features/query-filters/hooks/use-qf-builder';
import { useGetRulesQuery } from '@/features/rules';

interface UseThreatDetectionMethodsParams {
  threatId: string;
  page: number;
  pageSize: number;
  ordering?: string;
}

export const useThreatDetectionMethods = ({
  threatId,
  page,
  pageSize,
  ordering,
}: UseThreatDetectionMethodsParams) => {
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
        [QFBuilder.createFilter('stamus.threat_id', threatId!)],
        {
          untagged: true,
          informational: true,
          relevant: true,
        },
      ),
    },
    {
      skip: !threatId,
    },
  );
};
