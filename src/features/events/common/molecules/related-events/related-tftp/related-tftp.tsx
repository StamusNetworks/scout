import { TftpEvent } from '@/features/events/common/model/app-proto/tftp.schema';

import { RelatedTable } from '../related-table';
import { relatedFlowColumns } from './related-tftp.columns';

export const RelatedTftpTab = ({ data }: { data?: TftpEvent[] }) => (
  <RelatedTable<TftpEvent>
    columns={relatedFlowColumns}
    data={data || []}
  />
);
