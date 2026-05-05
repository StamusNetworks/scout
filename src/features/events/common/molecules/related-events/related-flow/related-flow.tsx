import { FlowEvent } from '@/features/events/model/event-types/flow.schema';

import { RelatedTable } from '../related-table';
import { relatedFlowColumns } from './related-flow.columns';

export const RelatedFlowTab = ({ data }: { data?: FlowEvent[] }) => (
  <RelatedTable<FlowEvent>
    columns={relatedFlowColumns}
    data={data || []}
  />
);
