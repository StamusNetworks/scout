import { SmbEvent } from '../../../model/event-types/smb.schema';
import { RelatedTable } from '../related-table';
import { relatedFlowColumns } from './related-smb.columns';

export const RelatedSmbTab = ({ data }: { data?: SmbEvent[] }) => (
  <RelatedTable<SmbEvent>
    columns={relatedFlowColumns}
    data={data || []}
  />
);
