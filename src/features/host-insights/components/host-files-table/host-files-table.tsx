import type { SortingState, Updater } from '@tanstack/react-table';
import { FileText } from 'lucide-react';
import { useMemo } from 'react';

import { DataTableEmpty } from '@/common/design-system/molecules/data-table/data-table-empty';
import { serializeSorting } from '@/common/design-system/molecules/data-table/hooks/sorting-parser';
import { useTablePreferences } from '@/common/design-system/molecules/data-table/hooks/use-table-preferences';
import { PaginationFooter } from '@/common/design-system/molecules/pagination-footer';
import { Table } from '@/common/design-system/molecules/table';
import { esEscape } from '@/common/lib/strings';
import { ExpandedEventRow, useGetEventsTailQuery } from '@/features/events';
import { useGlobalQueryParams } from '@/features/query-filters/hooks/use-global-query-params';

import { hostFilesTableColumns } from './host-files-table.columns';

interface HostFilesTableProps {
  hostId: string;
  page: number;
  pageSize: number;
  sorting: SortingState;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  onSortingChange: (updater: Updater<SortingState>) => void;
}

export function HostFilesTable({
  hostId,
  page,
  pageSize,
  sorting,
  onPageChange,
  onPageSizeChange,
  onSortingChange,
}: HostFilesTableProps) {
  const params = useGlobalQueryParams(['tenant', 'dates']);
  const ordering = serializeSorting(sorting) || '-timestamp';

  const {
    columnOrder,
    onColumnOrderChange,
    columnVisibility,
    onColumnVisibilityChange,
  } = useTablePreferences({
    tableId: 'hostFilesTable',
    columns: hostFilesTableColumns,
  });

  const queryParams = useMemo(
    () => ({
      ...params,
      qfilter: `(src_ip:"${esEscape(hostId ?? '')}" OR dest_ip:"${esEscape(hostId ?? '')}") AND event_type:fileinfo`,
      page,
      pageSize,
      ordering,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [hostId, params.tenant, params.from, params.to, page, pageSize, ordering],
  );

  const { data, isFetching } = useGetEventsTailQuery(queryParams);

  const results = data?.results ?? [];
  const total = data?.count ?? 0;

  return (
    <div className="space-y-2">
      <Table
        data={results}
        columns={hostFilesTableColumns}
        isLoading={isFetching}
        sorting={sorting}
        onSortingChange={onSortingChange}
        columnOrder={columnOrder}
        onColumnOrderChange={onColumnOrderChange}
        columnVisibility={columnVisibility}
        onColumnVisibilityChange={onColumnVisibilityChange}
        ExpandedRow={ExpandedEventRow}
        Empty={
          <DataTableEmpty
            Icon={FileText}
            entity="files"
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
