import { useMemo } from 'react';

import { useGlobalQueryParams } from '@/common/fetching/useQueryParams';
import { useGetSignaturesQuery } from '@/features/hunt/detection-methods/signatures/api/signatures.api';
import { DetectionMethodExpandedRowTemplate } from '@/features/hunt/detection-methods/signatures/components/signatures-table/signatures-table.expanded-row';
import { useQFBuilder } from '@/features/hunt/filtering/query-filters/hooks/use-qf-builder';

export const DetectionMethodTab = ({ sid }: { sid: number }) => {
  const QFBuilder = useQFBuilder();
  const extendQfilter = useMemo(
    () => [QFBuilder.createFilter('alert.signature_id', sid)],
    [sid, QFBuilder],
  );
  const params = useGlobalQueryParams(['tenant', 'dates', 'qfilter'], {
    extendQfilter,
  });

  const { data, isLoading } = useGetSignaturesQuery({
    ...params,
    ordering: '-hits',
  });

  if (isLoading || !data?.results.length) return null;

  return (
    <DetectionMethodExpandedRowTemplate detectionMethod={data.results[0]} />
  );
};
