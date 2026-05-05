import { useNavigate } from '@tanstack/react-router';

import { DataTable } from '@/common/design-system/molecules/data-table/data-table.tsx';
import { useServerTableState } from '@/common/design-system/molecules/data-table/hooks/use-server-table-state.ts';
import { useTablePreferences } from '@/common/design-system/molecules/data-table/hooks/use-table-preferences.ts';
import { useGetHostsQuery } from '@/features/host-insights/api/hosts.api';
import { HostsTableExpandedRow } from '@/features/host-insights/use-cases/host-details/molecules/hosts-table-expanded-row';
import { getFilterExtension } from '@/features/host-insights/use-cases/hosts-list/hosts-list.api';
import { useGlobalQueryParams } from '@/features/query-filters/hooks/use-global-query-params';
import { useQFBuilder } from '@/features/query-filters/hooks/use-qf-builder.ts';

import { columns, exportColumns } from './hostsTable.columns.tsx';

export const InventoryTable = ({
  inHomeNetwork,
}: {
  inHomeNetwork: 'true' | 'false' | 'all';
}) => {
  const {
    columnOrder,
    onColumnOrderChange,
    columnVisibility,
    onColumnVisibilityChange,
    canReset,
    onClickReset,
  } = useTablePreferences({
    tableId: 'inventoryTable',
    columns,
  });
  const navigate = useNavigate();

  const QFBuilder = useQFBuilder();
  const globalParams = useGlobalQueryParams(
    ['tenant', 'dates', 'qfilter', 'qfilterHost'],
    { extendQfilter: getFilterExtension(QFBuilder, inHomeNetwork) },
  );

  const { queryParams, pagination, setPagination, sorting, setSorting } =
    useServerTableState({
      tenant: globalParams.tenant,
      start_date: globalParams.start_date,
      end_date: globalParams.end_date,
      host_id_qfilter: globalParams.host_id_qfilter,
    });

  const { data, isFetching } = useGetHostsQuery({
    ...queryParams,
    withAlerts: false,
    ordering: queryParams.ordering ?? '-host_id.last_seen',
  });

  return (
    <DataTable
      data={data}
      isLoading={isFetching}
      columns={columns.filter((col) => col.id !== 'hits')}
      ExpandedRow={HostsTableExpandedRow}
      onRowClick={(row) => navigate({ to: `/hosts/${row.original.ip}` })}
      pagination={pagination}
      onPaginationChange={setPagination}
      sorting={sorting}
      onSortingChange={setSorting}
      exportColumns={exportColumns.filter((col) => col.label !== 'Hits')}
      columnOrder={columnOrder}
      onColumnOrderChange={onColumnOrderChange}
      columnVisibility={columnVisibility}
      onColumnVisibilityChange={onColumnVisibilityChange}
      canReset={canReset}
      onClickReset={onClickReset}
    />
  );
};
