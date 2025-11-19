import { TftpEvent } from '../../../model/event-types/tftp.schema';
import { RelatedTable } from '../related-table';
import { relatedFlowColumns } from './related-tftp.columns';

export const RelatedTftpTab = ({ data }: { data?: TftpEvent[] }) => (
  <RelatedTable<TftpEvent>
    columns={relatedFlowColumns}
    data={data || []}
  />
);
