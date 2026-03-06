import Flow from '@/common/design-system/graphs/proto-flow/flow';
import { FlowSkeleton } from '@/common/design-system/graphs/proto-flow/flow.skeleton';
import { useGlobalQueryParams } from '@/common/fetching/useQueryParams';
import { esEscape } from '@/common/lib/strings';

import { useGetTlsTailQuery } from '../../api/beaconing.api';
import { metadataColumns } from './beaconing-metadata.columns';

interface BeaconingMetadataProps {
  value: string;
  type: 'ja3s' | 'ip';
}
export const BeaconingMetadata = ({ value, type }: BeaconingMetadataProps) => {
  const params = useGlobalQueryParams(['tenant', 'dates']);
  const { data: events, isFetching } = useGetTlsTailQuery(
    {
      ...params,
      pageSize: 10000,
      qfilter: `${type === 'ja3s' ? 'tls.ja3s.hash' : `dest_ip.raw`}:${esEscape(value)}`,
    },
    {
      selectFromResult: (result) => ({
        ...result,
        data: result.data?.results,
      }),
    },
  );

  if (isFetching)
    return (
      <FlowSkeleton
        columns={metadataColumns}
        rowCount={1}
      />
    );

  if (!events) return <div>Error.</div>;

  return (
    <Flow
      events={events}
      columns={metadataColumns}
    />
  );
};
