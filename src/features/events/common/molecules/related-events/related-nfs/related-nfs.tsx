import { NfsEvent } from '@/features/events/common/model/app-proto/nfs.schema';

import { RelatedTable } from '../related-table';
import { relatedFlowColumns } from './related-nfs.columns';

export const RelatedNfsTab = ({ data }: { data?: NfsEvent[] }) => (
  <RelatedTable<NfsEvent>
    columns={relatedFlowColumns}
    data={data || []}
  />
);
