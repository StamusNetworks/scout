import { PaginationState } from '@tanstack/react-table';

import { useGetEventsQuery } from '@/features/events/common/events.api';
import { useGlobalQueryParams } from '@/features/query-filters/hooks/use-global-query-params';
import { useQFBuilder } from '@/features/query-filters/hooks/use-qf-builder';

interface UseThreatEventsParams {
  threatId: string;
  pagination: PaginationState;
  ordering?: string;
}

export const useThreatEvents = ({
  threatId,
  pagination,
  ordering,
}: UseThreatEventsParams) => {
  const QFBuilder = useQFBuilder();
  const params = useGlobalQueryParams(['tenant', 'dates']);
  return useGetEventsQuery(
    {
      ...params,
      ...pagination,
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
