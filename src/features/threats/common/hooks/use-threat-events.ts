import { PaginationState } from '@tanstack/react-table';

import { useGetEventsQuery } from '@/features/events/common/events.api';
import { useQFBuilder } from '@/features/filtering/filters/query-filters/hooks/use-qf-builder';
import { useGlobalQueryParams } from '@/features/filtering/use-global-query-params';

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
