import { Radar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { DataTable } from '@/common/design-system/molecules/data-table';
import { DataTableEmpty } from '@/common/design-system/molecules/data-table/data-table-empty';
import { useServerTableState } from '@/common/design-system/molecules/data-table/hooks/use-server-table-state.ts';
import { useGlobalQueryParams } from '@/common/fetching/useQueryParams';
import { routes } from '@/pages/routes.config';

import { useGetBeaconingEventsQuery } from '../../api/beaconing.api';
import {
  exportColumns,
  servingIpsTableColumns,
} from './serving-ips-table.columns';

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
        navigate(
          routes.analytics_beaconing_ips_details.replace(
            ':ip',
            row.original.beacon_report.value,
          ),
        )
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
