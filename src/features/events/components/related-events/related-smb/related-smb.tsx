import { SmbEvent } from '@/features/events/model/app-proto/smb.schema';

import { RelatedTable } from '../related-table';
import { relatedFlowColumns } from './related-smb.columns';

export const RelatedSmbTab = ({ data }: { data?: SmbEvent[] }) => (
  <RelatedTable<SmbEvent>
    columns={relatedFlowColumns}
    data={data || []}
  />
);
