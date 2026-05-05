import type { SortingState, Updater } from '@tanstack/react-table';
import { Radar } from 'lucide-react';
import { useMemo, useState } from 'react';

import { DataTableEmpty } from '@/common/design-system/molecules/data-table/data-table-empty';
import { DataTableToolbar } from '@/common/design-system/molecules/data-table/data-table.toolbar';
import { CommandFilterSingle } from '@/common/design-system/molecules/data-table/filters/command-filter-single';
import { TextFilter } from '@/common/design-system/molecules/data-table/filters/text-filter';
import { serializeSorting } from '@/common/design-system/molecules/data-table/hooks/sorting-parser';
import { useTablePreferences } from '@/common/design-system/molecules/data-table/hooks/use-table-preferences';
import { ExportButton } from '@/common/design-system/molecules/export-button';
import { PaginationFooter } from '@/common/design-system/molecules/pagination-footer';
import { Table } from '@/common/design-system/molecules/table';
import { esEscape } from '@/common/lib/strings';
import { useGetSightingEventsQuery } from '@/features/events/sightings/common/sightings.api';
import { useGlobalQueryParams } from '@/features/query-filters/hooks/use-global-query-params';

import {
  allSightingsExport,
  allSightingsTableColumns,
  sightingRoleOptions,
} from '../sightings-list.table';

interface SightingsTableProps {
  page: number;
  pageSize: number;
  sorting: SortingState;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  onSortingChange: (updater: Updater<SortingState>) => void;
  onRowClick: (sightingId: string) => void;
}

export function SightingsTable({
  page,
  pageSize,
  sorting,
  onPageChange,
  onPageSizeChange,
  onSortingChange,
  onRowClick,
}: SightingsTableProps) {
  const {
    columnOrder,
    onColumnOrderChange,
    columnVisibility,
    onColumnVisibilityChange,
  } = useTablePreferences({
    tableId: 'sightingsTable',
    columns: allSightingsTableColumns,
  });

  const globalParams = useGlobalQueryParams(['tenant', 'dates']);

  // Internal toolbar filter state
  const [search, setSearch] = useState('');
  const [role, setRole] = useState<string | null>(null);

  // Build qfilter from internal state
  const roleQfilter = !role
    ? null
    : role === 'unclassified'
      ? '(NOT discovery.asset_role:*)'
      : `discovery.asset_role:${role}`;
  const searchQfilter = search
    ? search
        .split(' ')
        .map((s) => `discovery.value:*${esEscape(s)}*`)
        .join(' AND ')
    : null;
  const qfilter =
    roleQfilter && searchQfilter
      ? `${roleQfilter} AND ${searchQfilter}`
      : roleQfilter || searchQfilter;

  const ordering = serializeSorting(sorting);
  const queryParams = useMemo(
    () => ({
      ...globalParams,
      ...(qfilter && { qfilter }),
      pageIndex: page - 1,
      pageSize,
      ordering,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      page,
      pageSize,
      ordering,
      qfilter,
      globalParams.start_date,
      globalParams.end_date,
      globalParams.tenant,
    ],
  );

  const { data, isFetching } = useGetSightingEventsQuery(queryParams);

  const results = data?.results ?? [];
  const total = data?.count ?? 0;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <DataTableToolbar>
          <TextFilter
            value={search}
            onChange={setSearch}
            placeholder="Search by discovered value"
          />
          <CommandFilterSingle
            title="Role"
            value={role}
            onChange={setRole}
            options={sightingRoleOptions}
          />
        </DataTableToolbar>

        <ExportButton
          data={results.map((row) =>
            allSightingsExport.map((col) => col.value(row)),
          )}
          headers={allSightingsExport.map((col) => col.label)}
          className="h-8"
        />
      </div>

      <Table
        data={results}
        columns={allSightingsTableColumns}
        isLoading={isFetching}
        sorting={sorting}
        onSortingChange={onSortingChange}
        columnVisibility={columnVisibility}
        onColumnVisibilityChange={onColumnVisibilityChange}
        columnOrder={columnOrder}
        onColumnOrderChange={onColumnOrderChange}
        onRowClick={(row) => onRowClick(row.original._id)}
        Empty={
          <DataTableEmpty
            Icon={Radar}
            entity="sightings"
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
