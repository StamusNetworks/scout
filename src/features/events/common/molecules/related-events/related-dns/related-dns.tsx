import { DnsEvent } from '@/features/events/model/app-proto/dns.schema';

import { RelatedTable } from '../related-table';
import { relatedFlowColumns } from './related-dns.columns';

export const RelatedDnsTab = ({ data }: { data?: DnsEvent[] }) => (
  <RelatedTable<DnsEvent>
    columns={relatedFlowColumns}
    data={data || []}
  />
);
