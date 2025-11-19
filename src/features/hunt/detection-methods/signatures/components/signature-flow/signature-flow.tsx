import { useMemo } from 'react';

import { ProtoFlow } from '@/common/design-system/graphs/proto-flow/proto-flow';
import { useGlobalQueryParams } from '@/common/fetching/useQueryParams';
import { useGetEventsQuery } from '@/features/hunt/events/api/events.api';
import { useQFBuilder } from '@/features/hunt/filtering/query-filters/hooks/use-qf-builder';

export const SignatureFlow = ({
  sid,
  methodType,
}: {
  sid: number;
  methodType?: string;
}) => {
  const QFBuilder = useQFBuilder();
  const extendQfilter = useMemo(
    () => [QFBuilder.createFilter('alert.signature_id', sid)],
    [sid, QFBuilder],
  );
  const params = useGlobalQueryParams(['tenant', 'dates', 'qfilter'], {
    extendQfilter,
  });
  const { data, isLoading } = useGetEventsQuery(params);

  if (isLoading || !data?.results?.length) return null;

  return (
    <ProtoFlow
      events={data.results}
      methodType={methodType}
    />
  );
};
