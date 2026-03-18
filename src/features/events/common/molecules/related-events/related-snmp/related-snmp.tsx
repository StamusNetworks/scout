import { SnmpEvent } from '@/features/events/common/model/app-proto/snmp.schema';

import { RelatedTable } from '../related-table';
import { relatedFlowColumns } from './related-snmp.columns';

export const RelatedSnmpTab = ({ data }: { data?: SnmpEvent[] }) => (
  <RelatedTable<SnmpEvent>
    columns={relatedFlowColumns}
    data={data || []}
  />
);
