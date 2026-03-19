import type { SortingState, Updater } from '@tanstack/react-table';
import { LaptopMinimal, RotateCcw } from 'lucide-react';
import { useMemo } from 'react';

import { Row } from '@/common/design-system/atoms/layout/row';
import { Button } from '@/common/design-system/atoms/ui/button';
import { DataTableToolbar } from '@/common/design-system/molecules/data-table/data-table.toolbar';
import { DataTableEmpty } from '@/common/design-system/molecules/data-table/data-table-empty';
import { SwitchFilter } from '@/common/design-system/molecules/data-table/filters/switch-filter';
import { serializeSorting } from '@/common/design-system/molecules/data-table/hooks/sorting-parser';
import { useTablePreferences } from '@/common/design-system/molecules/data-table/hooks/use-table-preferences';
import { ExportButton } from '@/common/design-system/molecules/export-button';
import { PaginationFooter } from '@/common/design-system/molecules/pagination-footer';
import { Table } from '@/common/design-system/molecules/table';
import { DiscoveredHosts } from '@/features/host-insights/common/discovered-hosts/discovered-hosts';
import { HomeNetPicker } from '@/features/host-insights/common/home-net-picker/home-net-picker';
import { HostsTableExpandedRow } from '@/features/host-insights/use-cases/host-details/molecules/hosts-table-expanded-row';

import { useHostsList } from '../hosts-list.api';
import {
  HITS_COLUMN,
  HOSTS_BASE_COLUMNS,
  HOSTS_EXPORT_COLUMNS,
} from '../hosts-list.table';

interface HostsTableProps {
  page: number;
  pageSize: number;
  sorting: SortingState;
  withAlerts: boolean;
  inHomeNet: 'true' | 'false' | 'all';
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  onSortingChange: (updater: Updater<SortingState>) => void;
  onWithAlertsChange: (withAlerts: boolean) => void;
  onInHomeNetChange: (value: 'true' | 'false' | 'all') => void;
  onRowClick: (hostId: string) => void;
}

export function HostsTable({
  page,
  pageSize,
  sorting,
  withAlerts,
  inHomeNet,
  onPageChange,
  onPageSizeChange,
  onSortingChange,
  onWithAlertsChange,
  onInHomeNetChange,
  onRowClick,
}: HostsTableProps) {
  const columns = useMemo(
    () =>
      withAlerts ? [...HOSTS_BASE_COLUMNS, HITS_COLUMN] : HOSTS_BASE_COLUMNS,
    [withAlerts],
  );

  const exportColumns = useMemo(
    () =>
      HOSTS_EXPORT_COLUMNS.filter((col) =>
        withAlerts ? true : col.label !== 'Hits',
      ),
    [withAlerts],
  );

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

  // Build ordering from sorting state, with sensible defaults
  const ordering =
    serializeSorting(sorting) ?? (withAlerts ? '-hits' : '-host_id.last_seen');

  // Fetch host data
  const { data, isFetching } = useHostsList({
    withAlerts,
    pagination: { pageIndex: page - 1, pageSize },
    inHomeNetwork: inHomeNet,
    ordering,
  });

  const results = data?.results ?? [];
  const total = data?.count ?? 0;

  return (
    <div className="space-y-4">
      <DiscoveredHosts />

      <div className="space-y-2">
        <Row className="items-center justify-between gap-2">
          <DataTableToolbar>
            <SwitchFilter
              title="Apply event filters"
              setValue={onWithAlertsChange}
              value={withAlerts}
            />
          </DataTableToolbar>

          <Row className="items-center gap-2">
            <HomeNetPicker
              value={inHomeNet}
              onChange={onInHomeNetChange}
            />
            <ExportButton
              data={results.map((row) =>
                exportColumns.map((col) => col.value(row)),
              )}
              headers={exportColumns.map((col) => col.label)}
              className="h-8"
            />
            {canReset && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="hidden h-8 border-dashed lg:flex"
                onClick={onClickReset}
                aria-label="Reset table view"
              >
                <RotateCcw className="h-4 w-4" />
                Reset
              </Button>
            )}
          </Row>
        </Row>

        <Table
          data={results}
          columns={columns}
          isLoading={isFetching}
          sorting={sorting}
          onSortingChange={onSortingChange}
          columnVisibility={columnVisibility}
          onColumnVisibilityChange={onColumnVisibilityChange}
          columnOrder={columnOrder}
          onColumnOrderChange={onColumnOrderChange}
          ExpandedRow={HostsTableExpandedRow}
          getRowId={(row) => row.ip}
          onRowClick={(row) => onRowClick(row.original.ip)}
          Empty={
            <DataTableEmpty
              Icon={LaptopMinimal}
              entity="hosts"
            />
          }
        />

        {total > 0 && (
          <PaginationFooter
            page={page}
            pageSize={pageSize}
            total={total}
            onPageChange={onPageChange}
            onPageSizeChange={onPageSizeChange}
          />
        )}
      </div>
    </div>
  );
}
