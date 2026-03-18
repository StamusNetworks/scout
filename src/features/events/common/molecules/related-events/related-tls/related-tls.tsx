import { TlsEvent } from '@/features/events/common/model/app-proto/tls.schema';

import { RelatedTable } from '../related-table';
import { relatedTlsColumns } from './related-tls.columns';

export const RelatedTlsTab = ({ data }: { data?: TlsEvent[] }) => (
  <RelatedTable<TlsEvent>
    columns={relatedTlsColumns}
    data={data || []}
  />
);
