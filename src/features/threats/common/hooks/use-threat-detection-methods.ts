import { PaginationState } from '@tanstack/react-table';

import { useGlobalQueryParams } from '@/common/fetching/useQueryParams';
import { useGetSignaturesQuery } from '@/features/hunt/detection-methods/signatures/api/signatures.api';
import { useQFBuilder } from '@/features/hunt/filtering/query-filters/hooks/use-qf-builder';

interface UseThreatEventsParams {
  threatId: string;
  pagination: PaginationState;
  ordering?: string;
}

export const useThreatDetectionMethods = ({
  threatId,
  pagination,
  ordering,
}: UseThreatEventsParams) => {
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
