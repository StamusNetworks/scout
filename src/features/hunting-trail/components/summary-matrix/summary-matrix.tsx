import type {
  ExpandedState,
  HeaderContext,
  Row,
  SortingState,
  Updater,
} from '@tanstack/react-table';
import { useMemo } from 'react';

import { DataTableColumnHeader } from '@/common/design-system/molecules/data-table/data-table.columnHeader';
import { CustomColumnDef } from '@/common/design-system/molecules/data-table/filters/filters.types';
import { PaginationFooter } from '@/common/design-system/molecules/pagination-footer';
import { Table } from '@/common/design-system/molecules/table';
import { EventValue } from '@/features/query-filters/components/interactive-value/event-value';

import {
  PURPOSE_SLUGS,
  type PurposeGroupData,
  type PurposeSlug,
} from '../../model/hunting-trail';
import type { QueryMetadataMap } from '../../model/purpose-grouping';
import { PurposeAggregated } from '../purpose-aggregated/purpose-aggregated';
import {
  type AssetRow,
  buildAssetMatrix,
  filterGroupsByAsset,
  sortAssetRows,
  sortingStateToKeyDirection,
} from './summary-matrix.aggregate';

interface SummaryMatrixProps {
  groups: Record<PurposeSlug, PurposeGroupData>;
  page: number;
  pageSize: number;
  sorting: SortingState;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  onSortingChange: (updater: Updater<SortingState>) => void;
  queryMetadata?: QueryMetadataMap;
}

const useColumns = (): CustomColumnDef<AssetRow>[] =>
  useMemo(
    () => [
      {
        id: 'asset',
        // accessorFn is only required so TanStack's getCanSort() returns true;
        // actual sort ordering is done by sortAssetRows under manualSorting.
        accessorFn: (row) => row.asset,
        header: ({ column }) => (
          <DataTableColumnHeader
            column={column}
            title="Asset"
          />
        ),
        enableSorting: true,
        cell: ({ row }) => (
          <EventValue
            query_key="ip"
            value={row.original.asset}
          />
        ),
      },
      ...PURPOSE_SLUGS.map(
        ({ slug, label }): CustomColumnDef<AssetRow> => ({
          id: slug,
          accessorFn: (row) => row.cells[slug]?.queryCount ?? 0,
          header: ({ column }: HeaderContext<AssetRow, unknown>) => (
            <DataTableColumnHeader
              column={column}
              title={label}
            />
          ),
          enableSorting: true,
          cell: ({ row }: { row: Row<AssetRow> }) => {
            const cell = row.original.cells[slug];
            return cell ? (
              <span className="text-muted-foreground text-sm">
                {cell.eventCount} events · {cell.queryCount} queries
              </span>
            ) : null;
          },
        }),
      ),
    ],
    [],
  );

export function SummaryMatrix({
  groups,
  page,
  pageSize,
  sorting,
  onPageChange,
  onPageSizeChange,
  onSortingChange,
  queryMetadata,
}: SummaryMatrixProps) {
  const allGroups = Object.values(groups);
  const isLoading = allGroups.some((g) => g.isLoading);
  const isError = allGroups.length > 0 && allGroups.every((g) => g.isError);

  const rows = useMemo(() => buildAssetMatrix(groups), [groups]);
  const sortedRows = useMemo(() => {
    const { key, direction } = sortingStateToKeyDirection(sorting);
    return sortAssetRows(rows, key, direction);
  }, [rows, sorting]);
  const columns = useColumns();

  if (isError) {
    return (
      <div
        className="text-destructive p-4 text-sm"
        role="alert"
      >
        Failed to load summary matrix.
      </div>
    );
  }

  const pageIndex = Math.max(0, page - 1);
  const pageStart = pageIndex * pageSize;
  const pageRows = isLoading
    ? []
    : sortedRows.slice(pageStart, pageStart + pageSize);

  const renderExpansion = ({ row }: { row: Row<AssetRow> }) => (
    <PurposeAggregated
      groups={filterGroupsByAsset(groups, row.original.asset)}
      queryMetadata={queryMetadata}
    />
  );

  return (
    <div className="flex flex-col gap-3">
      <Table
        data={pageRows}
        columns={columns}
        isLoading={isLoading}
        skeletonRows={pageSize}
        sorting={sorting}
        onSortingChange={onSortingChange}
        ExpandedRow={renderExpansion}
        getRowId={(row) => row.asset}
        reorder={false}
        Empty={
          <div className="text-muted-foreground p-4 text-center text-sm">
            No suspicious activity in the selected time range.
          </div>
        }
      />
      {!isLoading && sortedRows.length > 0 && (
        <PaginationFooter
          page={page}
          pageSize={pageSize}
          total={sortedRows.length}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
        />
      )}
    </div>
  );
}

// Re-exported for tests; consumers wishing to drive expansion externally can
// use the molecule's ExpandedState type.
export type SummaryMatrixExpandedState = ExpandedState;
