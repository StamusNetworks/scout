import { FtpDataEvent } from '@/features/events/model/app-proto/ftp-data.schema';

import { RelatedTable } from '../related-table';
import { relatedFlowColumns } from './related-ftp-data.columns';

export const RelatedFtpDataTab = ({ data }: { data?: FtpDataEvent[] }) => (
  <RelatedTable<FtpDataEvent>
    columns={relatedFlowColumns}
    data={data || []}
  />
);
