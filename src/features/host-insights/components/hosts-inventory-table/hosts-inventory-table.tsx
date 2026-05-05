import type { SortingState, Updater } from '@tanstack/react-table';
import { LaptopMinimal, RotateCcw } from 'lucide-react';

import { Row } from '@/common/design-system/atoms/layout/row';
import { Button } from '@/common/design-system/atoms/ui/button';
import { DataTableEmpty } from '@/common/design-system/molecules/data-table/data-table-empty';
import { serializeSorting } from '@/common/design-system/molecules/data-table/hooks/sorting-parser';
import { useTablePreferences } from '@/common/design-system/molecules/data-table/hooks/use-table-preferences';
import { ExportButton } from '@/common/design-system/molecules/export-button';
import { PaginationFooter } from '@/common/design-system/molecules/pagination-footer';
import { Table } from '@/common/design-system/molecules/table';
import { HostsTableExpandedRow } from '@/features/host-insights/components/hosts-table-expanded-row';
import {
  HOSTS_BASE_COLUMNS,
  HOSTS_EXPORT_COLUMNS,
} from '@/features/host-insights/definitions/hosts-table.columns';
import { useHostsList } from '@/features/host-insights/hooks/use-hosts-list';

interface HostsInventoryTableProps {
  page: number;
  pageSize: number;
  sorting: SortingState;
  inHomeNetwork: 'true' | 'false' | 'all';
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  onSortingChange: (updater: Updater<SortingState>) => void;
  onRowClick: (hostId: string) => void;
}

const columns = HOSTS_BASE_COLUMNS;
const exportColumns = HOSTS_EXPORT_COLUMNS.filter(
  (col) => col.label !== 'Hits',
);

export function HostsInventoryTable({
  page,
  pageSize,
  sorting,
  inHomeNetwork,
  onPageChange,
  onPageSizeChange,
  onSortingChange,
  onRowClick,
}: HostsInventoryTableProps) {
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

  const ordering = serializeSorting(sorting) ?? '-host_id.last_seen';

  const { data, isFetching } = useHostsList({
    withAlerts: false,
    pagination: { pageIndex: page - 1, pageSize },
    inHomeNetwork,
    ordering,
  });

  const results = data?.results ?? [];
  const total = data?.count ?? 0;

  return (
    <div className="space-y-2">
      <Row className="items-center justify-end gap-2">
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
  );
}
