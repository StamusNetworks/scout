import { LaptopMinimal } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';

import { DataTableToolbar } from '@/common/design-system/molecules/data-table/data-table.toolbar.tsx';
import { DataTable } from '@/common/design-system/molecules/data-table/data-table.tsx';
import { DataTableEmpty } from '@/common/design-system/molecules/data-table/data-table-empty.tsx';
import { SwitchFilter } from '@/common/design-system/molecules/data-table/filters/switch-filter.tsx';
import { useServerTableState } from '@/common/design-system/molecules/data-table/hooks/use-server-table-state.ts';
import { useTablePreferences } from '@/common/design-system/molecules/data-table/hooks/use-table-preferences.ts';
import { useGlobalQueryParams } from '@/common/fetching/useQueryParams.tsx';
import { useQFBuilder } from '@/features/hunt/filtering/query-filters/hooks/use-qf-builder.ts';

import { getFilterExtension } from '../../api/hooks/useHostsList.ts';
import { useGetHostsQuery } from '../../api/hosts.api.ts';
import { HostValuesSort } from '../host-insights/host-values-sort.tsx';
import { columns, exportColumns } from './hostsTable.columns.tsx';
import { HostsTableExpandedRow } from './hostsTable.expandedRow.tsx';
import { useWithAlertsParam } from './use-with-alerts-param.ts';

export const HostsTable = ({
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
    tableId: 'hostsTable',
    columns,
  });
  const navigate = useNavigate();
  const [withAlerts, setWithAlerts] = useWithAlertsParam();

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
      qfilter: withAlerts ? globalParams.qfilter : undefined,
      withAlerts,
      discovery: withAlerts ? globalParams.discovery : undefined,
      alert: withAlerts ? globalParams.alert : undefined,
      stamus: withAlerts ? globalParams.stamus : undefined,
    });

  const { data, isFetching } = useGetHostsQuery({
    ...queryParams,
    ordering:
      queryParams.ordering ?? (withAlerts ? '-hits' : '-host_id.last_seen'),
  });

  return (
    <DataTable
      data={data}
      isLoading={isFetching}
      columns={columns.filter((col) => (withAlerts ? true : col.id !== 'hits'))}
      ExpandedRow={HostsTableExpandedRow}
      onRowClick={(row) => navigate({ to: `/hosts/${row.original.ip}` })}
      pagination={pagination}
      onPaginationChange={setPagination}
      sorting={sorting}
      onSortingChange={setSorting}
      toolBar={
        <DataTableToolbar>
          <SwitchFilter
            title="Apply event filters"
            setValue={setWithAlerts}
            value={withAlerts}
          />
          <div className="ml-2">
            <HostValuesSort />
          </div>
        </DataTableToolbar>
      }
      exportColumns={exportColumns.filter((col) =>
        withAlerts ? true : col.label !== 'Hits',
      )}
      columnOrder={columnOrder}
      onColumnOrderChange={onColumnOrderChange}
      columnVisibility={columnVisibility}
      onColumnVisibilityChange={onColumnVisibilityChange}
      canReset={canReset}
      onClickReset={onClickReset}
      Empty={
        <DataTableEmpty
          Icon={LaptopMinimal}
          entity="hosts"
        />
      }
    />
  );
};
