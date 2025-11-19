import { StamusEvent } from '../../../model/event-types/stamus.schema';
import { RelatedTable } from '../related-table';
import { relatedStamusColumns } from './related-stamus.columns';

export const RelatedStamusTab = ({ data }: { data?: StamusEvent[] }) => (
  <RelatedTable<StamusEvent>
    columns={relatedStamusColumns}
    data={data || []}
  />
);
