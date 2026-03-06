import { DataTable } from '@/common/design-system/molecules/data-table';
import { usePaginationState } from '@/common/design-system/molecules/data-table/hooks/use-pagination';
import { useGlobalQueryParams } from '@/common/fetching/useQueryParams';
import { esEscape } from '@/common/lib/strings';
import { useGetHostsQuery } from '@/features/analytics/hosts/api/hosts.api';

import { beaconingIpsTableColumns } from './beaconing-ips-table.columns';

interface BeaconingIpsTableProps {
  ips: string[] | undefined;
}
export const BeaconingIPsTable = ({ ips }: BeaconingIpsTableProps) => {
  const params = useGlobalQueryParams(['tenant', 'dates']);
  const [pagination, setPagination] = usePaginationState();
  const { data, isFetching } = useGetHostsQuery(
    {
      ...params,
      ...pagination,
      host_id_qfilter: ips?.map((ip) => `ip:${esEscape(ip)}`).join(' OR '),
    },
    {
      skip: !ips,
    },
  );
  return (
    <DataTable
      data={data}
      columns={beaconingIpsTableColumns}
      isLoading={isFetching}
      pagination={pagination}
      onPaginationChange={setPagination}
    />
  );
};
