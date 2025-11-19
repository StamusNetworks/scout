import { NfsEvent } from '../../../model/event-types/nfs.schema';
import { RelatedTable } from '../related-table';
import { relatedFlowColumns } from './related-nfs.columns';

export const RelatedNfsTab = ({ data }: { data?: NfsEvent[] }) => (
  <RelatedTable<NfsEvent>
    columns={relatedFlowColumns}
    data={data || []}
  />
);
