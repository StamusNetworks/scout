import { FtpEvent } from '@/features/events/common/model/app-proto/ftp.schema';

import { RelatedTable } from '../related-table';
import { relatedFlowColumns } from './related-ftp.columns';

export const RelatedFtpTab = ({ data }: { data?: FtpEvent[] }) => (
  <RelatedTable<FtpEvent>
    columns={relatedFlowColumns}
    data={data || []}
  />
);
