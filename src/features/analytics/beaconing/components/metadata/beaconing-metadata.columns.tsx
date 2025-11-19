import {
  JA3Col,
  ProtoColumn,
} from '@/common/design-system/graphs/proto-flow/flow.columns';
import { TlsTail } from '@/features/analytics/beaconing/models/tls-tail.model';

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
