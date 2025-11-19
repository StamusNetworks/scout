import { TlsEvent } from '../../../model/event-types/tls.schema';
import { RelatedTable } from '../related-table';
import { relatedTlsColumns } from './related-tls.columns';

export const RelatedTlsTab = ({ data }: { data?: TlsEvent[] }) => (
  <RelatedTable<TlsEvent>
    columns={relatedTlsColumns}
    data={data || []}
  />
);
