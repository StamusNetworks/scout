import { useNavigate } from 'react-router-dom';

import { DataTable } from '@/common/design-system/molecules/data-table';
import { usePaginationUrlState } from '@/common/design-system/molecules/data-table/hooks/use-pagination';
import { useSortingUrlState } from '@/common/design-system/molecules/data-table/hooks/use-sorting';
import { useGlobalQueryParams } from '@/common/fetching/useQueryParams';
import { routes } from '@/pages/routes.config';

import { useGetBeaconingEventsQuery } from '../../api/beaconing.api';
import { exportColumns, tlsJ3ASTableColumns } from './tls-ja3s-table.columns';

export const JA3SHashTable = () => {
  const navigate = useNavigate();
  const [pagination, setPagination] = usePaginationUrlState();
  const [sorting, setSorting, ordering] = useSortingUrlState();
  const params = useGlobalQueryParams(['tenant', 'dates']);
  const { data, isFetching } = useGetBeaconingEventsQuery({
    ...params,
    ...pagination,
    ordering,
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
        navigate(
          routes.beaconing_ja3s_details.replace(
            ':ja3s',
            row.original.beacon_report.value,
          ),
        )
      }
      exportColumns={exportColumns}
    />
  );
};
