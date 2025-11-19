import { NetflowEvent } from '../../../model/event-types/netflow.schema';
import { RelatedTable } from '../related-table';
import { relatedFlowColumns } from './related-netflow.columns';

export const RelatedNetflowTab = ({ data }: { data?: NetflowEvent[] }) => (
  <RelatedTable<NetflowEvent>
    columns={relatedFlowColumns}
    data={data || []}
  />
);
