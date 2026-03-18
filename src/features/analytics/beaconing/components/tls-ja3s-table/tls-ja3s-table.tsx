import { useNavigate } from '@tanstack/react-router';
import { Radar } from 'lucide-react';

import { DataTable } from '@/common/design-system/molecules/data-table';
import { DataTableEmpty } from '@/common/design-system/molecules/data-table/data-table-empty';
import { useServerTableState } from '@/common/design-system/molecules/data-table/hooks/use-server-table-state.ts';
import { useGlobalQueryParams } from '@/common/fetching/useQueryParams';
import {
  exportColumns,
  tlsJ3ASTableColumns,
} from '@/features/events/beaconing/beaconing-ja3s/use-cases/ja3s-list/ja3s-list.table';
import { useGetBeaconingEventsQuery } from '@/features/events/beaconing/common/beaconing.api';

export const JA3SHashTable = () => {
  const navigate = useNavigate();
  const params = useGlobalQueryParams(['tenant', 'dates']);
  const { queryParams, pagination, setPagination, sorting, setSorting } =
    useServerTableState(params);
  const { data, isFetching } = useGetBeaconingEventsQuery({
    ...queryParams,
    qfilter: 'beacon_report.document_type:agg_ja3s_src_only',
  });
  return (
    <DataTable
      data={data}
      isLoading={isFetching}
      columns={tlsJ3ASTableColumns}
      serverSide
      pagination={pagination}
      onPaginationChange={setPagination}
      sorting={sorting}
      onSortingChange={setSorting}
      onRowClick={(row) =>
        navigate({
          to: `/analytics/beaconing/ja3s/${row.original.beacon_report.value}`,
        })
      }
      exportColumns={exportColumns}
      Empty={
        <DataTableEmpty
          Icon={Radar}
          entity="beaconing JA3s hashes"
        />
      }
    />
  );
};
