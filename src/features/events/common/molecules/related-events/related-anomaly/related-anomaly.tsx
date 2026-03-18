import { Anomaly } from '@/features/events/common/model/event-types/anomaly.schema';

import { RelatedTable } from '../related-table';
import { relatedFlowColumns } from './related-anomaly.columns';

export const RelatedAnomalyTab = ({ data }: { data?: Anomaly[] }) => (
  <RelatedTable<Anomaly>
    columns={relatedFlowColumns}
    data={data || []}
  />
);
