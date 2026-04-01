import Flow from '@/common/design-system/graphs/proto-flow/flow';
import {
  JA3Col,
  ProtoColumn,
} from '@/common/design-system/graphs/proto-flow/flow.columns';
import { FlowSkeleton } from '@/common/design-system/graphs/proto-flow/flow.skeleton';
import { esEscape } from '@/common/lib/strings';
import { useGlobalQueryParams } from '@/features/filtering/use-global-query-params';

import { TlsTail } from '../beaconing-event.model';
import { useGetTlsTailQuery } from '../beaconing.api';

// Columns

export const metadataColumns: ProtoColumn<TlsTail>[] = [
  {
    title: 'Source IP',
    key: 'src_ip',
    missing: 'Missing source IP',
  },
  JA3Col as unknown as ProtoColumn<TlsTail>,
  {
    title: 'SNI',
    key: 'tls.sni',
    missing: 'Missing SNI',
  },
  {
    title: 'Destination IP',
    key: 'dest_ip',
    missing: 'Missing destination IP',
  },
  {
    title: 'Fingerprint',
    key: 'tls.fingerprint',
    missing: 'Missing fingerprint',
  },
  {
    title: 'Subject DN',
    key: 'tls.subject',
    missing: 'Missing subject DN',
  },
  {
    title: 'Issuer DN',
    key: 'tls.issuerdn',
    missing: 'Missing issuer DN',
  },
  {
    title: 'Version',
    key: 'tls.version',
    missing: 'Missing version',
  },
];

// Component

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
