import type { SortingState, Updater } from '@tanstack/react-table';
import { Radar } from 'lucide-react';
import { useMemo } from 'react';

import { DataTableEmpty } from '@/common/design-system/molecules/data-table/data-table-empty';
import { serializeSorting } from '@/common/design-system/molecules/data-table/hooks/sorting-parser';
import { useTablePreferences } from '@/common/design-system/molecules/data-table/hooks/use-table-preferences';
import { ExportButton } from '@/common/design-system/molecules/export-button';
import { PaginationFooter } from '@/common/design-system/molecules/pagination-footer';
import { Table } from '@/common/design-system/molecules/table';
import { useGlobalQueryParams } from '@/common/fetching/useQueryParams';
import { useGetBeaconingEventsQuery } from '@/features/events/beaconing/common/beaconing.api';

import { exportColumns, servingIpsTableColumns } from '../ips-list.table';

interface ServingIpsTableProps {
  page: number;
  pageSize: number;
  sorting: SortingState;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  onSortingChange: (updater: Updater<SortingState>) => void;
  onRowClick: (ip: string) => void;
}

export function ServingIpsTable({
  page,
  pageSize,
  sorting,
  onPageChange,
  onPageSizeChange,
  onSortingChange,
  onRowClick,
}: ServingIpsTableProps) {
  const {
    columnOrder,
    onColumnOrderChange,
    columnVisibility,
    onColumnVisibilityChange,
  } = useTablePreferences({
    tableId: 'servingIpsTable',
    columns: servingIpsTableColumns,
  });

  const globalParams = useGlobalQueryParams(['tenant', 'dates']);

  const ordering = serializeSorting(sorting);
  const queryParams = useMemo(
    () => ({
      ...globalParams,
      qfilter: 'beacon_report.document_type:agg_serving_ip',
      pageIndex: page - 1,
      pageSize,
      ordering,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      page,
      pageSize,
      ordering,
      globalParams.start_date,
      globalParams.end_date,
      globalParams.tenant,
    ],
  );

  const { data, isFetching } = useGetBeaconingEventsQuery(queryParams);

  const results = data?.results ?? [];
  const total = data?.count ?? 0;

  return (
    <div className="space-y-2">
      <div className="flex justify-end">
        <ExportButton
          data={results.map((row) =>
            exportColumns.map((col) => col.value(row)),
          )}
          headers={exportColumns.map((col) => col.label)}
          className="h-8"
        />
      </div>

      <Table
        data={results}
        columns={servingIpsTableColumns}
        isLoading={isFetching}
        sorting={sorting}
        onSortingChange={onSortingChange}
        columnVisibility={columnVisibility}
        onColumnVisibilityChange={onColumnVisibilityChange}
        columnOrder={columnOrder}
        onColumnOrderChange={onColumnOrderChange}
        onRowClick={(row) => onRowClick(row.original.beacon_report.value)}
        Empty={
          <DataTableEmpty
            Icon={Radar}
            entity="beaconing IPs"
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
