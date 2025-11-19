import { DcerpcEvent } from '../../../model/event-types/dcerpc.schema';
import { RelatedTable } from '../related-table';
import { relatedFlowColumns } from './related-dcerpc.columns';

export const RelatedDcerpcTab = ({ data }: { data?: DcerpcEvent[] }) => (
  <RelatedTable<DcerpcEvent>
    columns={relatedFlowColumns}
    data={data || []}
  />
);
