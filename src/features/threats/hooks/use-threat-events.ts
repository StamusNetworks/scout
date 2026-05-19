import { useGetEventsQuery } from '@/features/events';
import { useGlobalQueryParams } from '@/features/query-filters/hooks/use-global-query-params';
import { useQFBuilder } from '@/features/query-filters/hooks/use-qf-builder';

interface UseThreatEventsParams {
  threatId: string;
  page: number;
  pageSize: number;
  ordering?: string;
}

export const useThreatEvents = ({
  threatId,
  page,
  pageSize,
  ordering,
}: UseThreatEventsParams) => {
  const QFBuilder = useQFBuilder();
  const params = useGlobalQueryParams(['tenant', 'dates']);
  return useGetEventsQuery(
    {
      ...params,
      page,
      pageSize,
      alert: true,
      stamus: true,
      discovery: true,
      ordering,
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
