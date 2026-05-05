import { FtpDataEvent } from '@/features/events/model/app-proto/ftp-data.schema';

import { RelatedTable } from '../related-table';
import { relatedFlowColumns } from './related-ftp_data.columns';

export const RelatedFtp_DataTab = ({ data }: { data?: FtpDataEvent[] }) => (
  <RelatedTable<FtpDataEvent>
    columns={relatedFlowColumns}
    data={data || []}
  />
);
