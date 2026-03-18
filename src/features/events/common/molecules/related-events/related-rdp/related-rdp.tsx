import { RdpEvent } from '@/features/events/common/model/app-proto/rdp.schema';

import { RelatedTable } from '../related-table';
import { relatedFlowColumns } from './related-rdp.columns';

export const RelatedRdpTab = ({ data }: { data?: RdpEvent[] }) => (
  <RelatedTable<RdpEvent>
    columns={relatedFlowColumns}
    data={data || []}
  />
);
