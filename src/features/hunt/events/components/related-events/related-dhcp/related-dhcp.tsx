import { DhcpEvent } from '../../../model/app-proto/dhcp.schema';
import { RelatedTable } from '../related-table';
import { relatedFlowColumns } from './related-dhcp.columns';

export const RelatedDhcpTab = ({ data }: { data?: DhcpEvent[] }) => (
  <RelatedTable<DhcpEvent>
    columns={relatedFlowColumns}
    data={data || []}
  />
);
