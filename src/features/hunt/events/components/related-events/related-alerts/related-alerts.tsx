import { AlertEvent } from '../../../model/event-types/alert.schema';
import { RelatedTable } from '../related-table';
import { relatedAlertsColumns } from './related-alerts.columns';

export const RelatedAlertsTab = ({ data }: { data?: AlertEvent[] }) => (
  <RelatedTable<AlertEvent>
    columns={relatedAlertsColumns}
    data={data || []}
  />
);
