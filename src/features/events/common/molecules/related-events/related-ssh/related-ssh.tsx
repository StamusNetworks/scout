import { SshEvent } from '@/features/events/common/model/app-proto/ssh.schema';

import { RelatedTable } from '../related-table';
import { relatedFlowColumns } from './related-ssh.columns';

export const RelatedSshTab = ({ data }: { data?: SshEvent[] }) => (
  <RelatedTable<SshEvent>
    columns={relatedFlowColumns}
    data={data || []}
  />
);
