import { SmtpEvent } from '@/features/events/model/app-proto/smtp.schema';

import { RelatedTable } from '../related-table';
import { relatedFlowColumns } from './related-smtp.columns';

export const RelatedSmtpTab = ({ data }: { data?: SmtpEvent[] }) => (
  <RelatedTable<SmtpEvent>
    columns={relatedFlowColumns}
    data={data || []}
  />
);
