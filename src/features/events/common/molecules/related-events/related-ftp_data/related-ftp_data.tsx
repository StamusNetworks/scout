import { FtpDataEvent } from '@/features/events/common/model/app-proto/ftp_data.schema';

import { RelatedTable } from '../related-table';
import { relatedFlowColumns } from './related-ftp_data.columns';

export const RelatedFtp_DataTab = ({ data }: { data?: FtpDataEvent[] }) => (
  <RelatedTable<FtpDataEvent>
    columns={relatedFlowColumns}
    data={data || []}
  />
);
