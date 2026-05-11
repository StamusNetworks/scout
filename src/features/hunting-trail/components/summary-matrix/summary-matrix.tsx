import type { ExpandedState, Row } from '@tanstack/react-table';
import { useMemo } from 'react';

import { CustomColumnDef } from '@/common/design-system/molecules/data-table/filters/filters.types';
import { usePaginationUrlState } from '@/common/design-system/molecules/data-table/hooks/use-pagination';
import { PaginationFooter } from '@/common/design-system/molecules/pagination-footer';
import { Table } from '@/common/design-system/molecules/table';
import { EventValue } from '@/features/query-filters/components/interactive-value/event-value';

import {
  PURPOSE_SLUGS,
  type PurposeGroupData,
  type PurposeSlug,
} from '../../model/hunting-trail';
import { PurposeAggregated } from '../purpose-aggregated/purpose-aggregated';
import {
  type AssetRow,
  buildAssetMatrix,
  filterGroupsByAsset,
} from './summary-matrix.aggregate';

const DEFAULT_PAGE_SIZE = 20;

interface SummaryMatrixProps {
  groups: Record<PurposeSlug, PurposeGroupData>;
}

const useColumns = (): CustomColumnDef<AssetRow>[] =>
  useMemo(
    () => [
      {
        id: 'asset',
        header: 'Asset',
        cell: ({ row }) => (
          <EventValue
            query_key="ip"
            value={row.original.asset}
          />
        ),
      },
      ...PURPOSE_SLUGS.map(({ slug, label }) => ({
        id: slug,
        header: label,
        cell: ({ row }: { row: Row<AssetRow> }) => {
          const cell = row.original.cells[slug];
          return cell ? (
            <span className="text-muted-foreground text-sm">
              {cell.eventCount} events · {cell.queryCount} queries
            </span>
          ) : null;
        },
      })),
    ],
    [],
  );

export function SummaryMatrix({ groups }: SummaryMatrixProps) {
  const allGroups = Object.values(groups);
  const isLoading = allGroups.some((g) => g.isLoading);
  const isError = allGroups.length > 0 && allGroups.every((g) => g.isError);

  const rows = useMemo(() => buildAssetMatrix(groups), [groups]);
  const [pagination, setPagination] = usePaginationUrlState(DEFAULT_PAGE_SIZE);
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

  const pageStart = pagination.pageIndex * pagination.pageSize;
  const pageRows = isLoading
    ? []
    : rows.slice(pageStart, pageStart + pagination.pageSize);

  const renderExpansion = ({ row }: { row: Row<AssetRow> }) => (
    <PurposeAggregated
      groups={filterGroupsByAsset(groups, row.original.asset)}
    />
  );

  return (
    <div className="flex flex-col gap-3">
      <Table
        data={pageRows}
        columns={columns}
        isLoading={isLoading}
        skeletonRows={pagination.pageSize}
        ExpandedRow={renderExpansion}
        getRowId={(row) => row.asset}
        reorder={false}
        Empty={
          <div className="text-muted-foreground p-4 text-center text-sm">
            No suspicious activity in the selected time range.
          </div>
        }
      />
      {!isLoading && rows.length > 0 && (
        <PaginationFooter
          page={pagination.pageIndex + 1}
          pageSize={pagination.pageSize}
          total={rows.length}
          onPageChange={(page) =>
            setPagination((prev) => ({ ...prev, pageIndex: page - 1 }))
          }
          onPageSizeChange={(pageSize) =>
            setPagination((prev) => ({ ...prev, pageSize, pageIndex: 0 }))
          }
        />
      )}
    </div>
  );
}

// Re-exported for tests; consumers wishing to drive expansion externally can
// use the molecule's ExpandedState type.
export type SummaryMatrixExpandedState = ExpandedState;
