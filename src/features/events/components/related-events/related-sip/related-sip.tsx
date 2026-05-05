import { SipEvent } from '@/features/events/model/app-proto/sip.schema';

import { RelatedTable } from '../related-table';
import { relatedFlowColumns } from './related-sip.columns';

export const RelatedSipTab = ({ data }: { data?: SipEvent[] }) => (
  <RelatedTable<SipEvent>
    columns={relatedFlowColumns}
    data={data || []}
  />
);
