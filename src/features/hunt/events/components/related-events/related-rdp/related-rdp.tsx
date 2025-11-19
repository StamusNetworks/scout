import { RdpEvent } from '../../../model/event-types/rdp.schema';
import { RelatedTable } from '../related-table';
import { relatedFlowColumns } from './related-rdp.columns';

export const RelatedRdpTab = ({ data }: { data?: RdpEvent[] }) => (
  <RelatedTable<RdpEvent>
    columns={relatedFlowColumns}
    data={data || []}
  />
);
