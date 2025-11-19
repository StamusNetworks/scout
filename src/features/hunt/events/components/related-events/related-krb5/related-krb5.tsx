import { Krb5Event } from '../../../model/event-types/krb5.schema';
import { RelatedTable } from '../related-table';
import { relatedFlowColumns } from './related-krb5.columns';

export const RelatedKrb5Tab = ({ data }: { data?: Krb5Event[] }) => (
  <RelatedTable<Krb5Event>
    columns={relatedFlowColumns}
    data={data || []}
  />
);
