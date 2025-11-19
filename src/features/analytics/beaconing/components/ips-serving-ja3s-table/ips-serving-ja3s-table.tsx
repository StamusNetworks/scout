import { DataTable } from '@/common/design-system/molecules/data-table';
import { usePaginationState } from '@/common/design-system/molecules/data-table/hooks/use-pagination';
import { useGlobalQueryParams } from '@/common/fetching/useQueryParams';

import { useGetBeaconingEventsQuery } from '../../api/beaconing.api';
import { ipsServingJa3sTableColumns } from './ips-serving-ja3s-table.column';

interface IpsServingJa3sTableProps {
  ja3s: string;
}
export const IpsServingJa3sTable = ({ ja3s }: IpsServingJa3sTableProps) => {
  const params = useGlobalQueryParams(['tenant', 'dates']);
  const [pagination, setPagination] = usePaginationState();
  const { data, isFetching } = useGetBeaconingEventsQuery({
    ...params,
    ...pagination,
    qfilter: `beacon_report.document_type:agg_serving_ip AND beacon_report.server_hash:${ja3s}`,
  });

  return (
    <DataTable
      data={data}
      isLoading={isFetching}
      columns={ipsServingJa3sTableColumns}
      pagination={pagination}
      onPaginationChange={setPagination}
    />
  );
};
