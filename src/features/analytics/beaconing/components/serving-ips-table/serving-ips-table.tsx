import { useNavigate } from '@tanstack/react-router';
import { Radar } from 'lucide-react';

import { DataTable } from '@/common/design-system/molecules/data-table';
import { DataTableEmpty } from '@/common/design-system/molecules/data-table/data-table-empty';
import { useServerTableState } from '@/common/design-system/molecules/data-table/hooks/use-server-table-state.ts';
import { useGlobalQueryParams } from '@/common/fetching/useQueryParams';
import {
  exportColumns,
  servingIpsTableColumns,
} from '@/features/events/beaconing/beaconing-ips/use-cases/ips-list/ips-list.table';
import { useGetBeaconingEventsQuery } from '@/features/events/beaconing/common/beaconing.api';

export const ServingIpsTable = () => {
  const navigate = useNavigate();
  const params = useGlobalQueryParams(['tenant', 'dates']);
  const { queryParams, pagination, setPagination, sorting, setSorting } =
    useServerTableState(params);
  const { data, isFetching } = useGetBeaconingEventsQuery({
    ...queryParams,
    qfilter: 'beacon_report.document_type:agg_serving_ip',
  });
  return (
    <DataTable
      data={data}
      isLoading={isFetching}
      columns={servingIpsTableColumns}
      serverSide
      pagination={pagination}
      onPaginationChange={setPagination}
      sorting={sorting}
      onSortingChange={setSorting}
      onRowClick={(row) =>
        navigate({
          to: `/analytics/beaconing/ips/${row.original.beacon_report.value}`,
        })
      }
      exportColumns={exportColumns}
      Empty={
        <DataTableEmpty
          Icon={Radar}
          entity="beaconing IPs"
        />
      }
    />
  );
};
