import { DhcpEvent } from '../../../model/event-types/dhcp.schema';
import { RelatedTable } from '../related-table';
import { relatedFlowColumns } from './related-dhcp.columns';

export const RelatedDhcpTab = ({ data }: { data?: DhcpEvent[] }) => (
  <RelatedTable<DhcpEvent>
    columns={relatedFlowColumns}
    data={data || []}
  />
);
