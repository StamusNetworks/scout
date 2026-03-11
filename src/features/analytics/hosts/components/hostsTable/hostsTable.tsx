import { useNavigate } from '@tanstack/react-router';
import type {
  OnChangeFn,
  PaginationState,
  SortingState,
  Updater,
} from '@tanstack/react-table';
import { LaptopMinimal } from 'lucide-react';

import type { ExportColumn } from '@/common/design-system/molecules/data-table/data-table';
import { DataTable } from '@/common/design-system/molecules/data-table/data-table';
import { DataTableEmpty } from '@/common/design-system/molecules/data-table/data-table-empty';
import { DataTableToolbar } from '@/common/design-system/molecules/data-table/data-table.toolbar';
import type { CustomColumnDef } from '@/common/design-system/molecules/data-table/filters/filters.types';
import { SwitchFilter } from '@/common/design-system/molecules/data-table/filters/switch-filter';
import { useTablePreferences } from '@/common/design-system/molecules/data-table/hooks/use-table-preferences';
import type { Paginated } from '@/common/fetching/fetching.types';
import type { Host } from '@/features/analytics/hosts/model/host';

import { HostValuesSort } from '../host-insights/host-values-sort';
import { HostsTableExpandedRow } from './hostsTable.expandedRow';

type HostsTableProps = {
  data: Paginated<Host> | undefined;
  isLoading: boolean;
  columns: CustomColumnDef<Host>[];
  exportColumns: ExportColumn<Host>[];
  pagination: PaginationState;
  onPaginationChange: (updater: Updater<PaginationState>) => void;
  sorting: SortingState;
  onSortingChange: OnChangeFn<SortingState>;
  withAlerts: boolean;
  onWithAlertsChange: (value: boolean) => void;
};

export const HostsTable = ({
  data,
  isLoading,
  columns,
  exportColumns,
  pagination,
  onPaginationChange,
  sorting,
  onSortingChange,
  withAlerts,
  onWithAlertsChange,
}: HostsTableProps) => {
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

  return (
    <DataTable
      data={data}
      isLoading={isLoading}
      columns={columns}
      ExpandedRow={HostsTableExpandedRow}
      onRowClick={(row) => navigate({ to: `/hosts/${row.original.ip}` })}
      pagination={pagination}
      onPaginationChange={onPaginationChange}
      sorting={sorting}
      onSortingChange={onSortingChange}
      toolBar={
        <DataTableToolbar>
          <SwitchFilter
            title="Apply event filters"
            setValue={onWithAlertsChange}
            value={withAlerts}
          />
          <div className="ml-2">
            <HostValuesSort />
          </div>
        </DataTableToolbar>
      }
      exportColumns={exportColumns}
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
