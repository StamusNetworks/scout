import { FileinfoEvent } from '../../../model/event-types/fileinfo.schema';
import { RelatedTable } from '../related-table';
import { relatedFileinfoColumns } from './related-file-info.columns';

export const RelatedFileinfoTab = ({ data }: { data?: FileinfoEvent[] }) => (
  <RelatedTable<FileinfoEvent>
    columns={relatedFileinfoColumns}
    data={data || []}
  />
);
