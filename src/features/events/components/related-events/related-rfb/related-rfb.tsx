import { RfbEvent } from '@/features/events/model/app-proto/rfb.schema';

import { RelatedTable } from '../related-table';
import { relatedFlowColumns } from './related-rfb.columns';

export const RelatedRfbTab = ({ data }: { data?: RfbEvent[] }) => (
  <RelatedTable<RfbEvent>
    columns={relatedFlowColumns}
    data={data || []}
  />
);
