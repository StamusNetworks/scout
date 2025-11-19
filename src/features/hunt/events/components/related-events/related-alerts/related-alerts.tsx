import { FlowAlert } from '../../../model/event-types/alert.schema';
import { RelatedTable } from '../related-table';
import { relatedAlertsColumns } from './related-alerts.columns';

export const RelatedAlertsTab = ({ data }: { data?: FlowAlert[] }) => (
  <RelatedTable<FlowAlert>
    columns={relatedAlertsColumns}
    data={data || []}
  />
);
