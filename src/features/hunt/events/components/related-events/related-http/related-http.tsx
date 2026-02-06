import { HttpEvent } from '../../../model/app-proto/http.schema';
import { RelatedTable } from '../related-table';
import { relatedHttpColumns } from './related-http.columns';

export const RelatedHttpTab = ({ data }: { data?: HttpEvent[] }) => (
  <RelatedTable<HttpEvent>
    columns={relatedHttpColumns}
    data={data || []}
  />
);
