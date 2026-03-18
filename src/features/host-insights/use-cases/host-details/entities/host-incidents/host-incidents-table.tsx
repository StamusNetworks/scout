import type { SortingState, Updater } from '@tanstack/react-table';
import { Biohazard } from 'lucide-react';
import { useMemo } from 'react';

import { DataTableEmpty } from '@/common/design-system/molecules/data-table/data-table-empty';
import { serializeSorting } from '@/common/design-system/molecules/data-table/hooks/sorting-parser';
import { PaginationFooter } from '@/common/design-system/molecules/pagination-footer';
import { Table } from '@/common/design-system/molecules/table';
import { useGlobalQueryParams } from '@/common/fetching/useQueryParams';
import { useGetThreatsStatusQuery } from '@/features/threats/common/threats.api';

import { threatStatusColumns } from './threat-status.columns';
import { ThreatStatusExpandedRow } from './threat-status.expanded-row';

const columns = threatStatusColumns
  .filter((col) => !['target', 'target_type'].includes(col.id!))
  .map((col) => ({ ...col, visible: true }));

interface HostIncidentsTableProps {
  hostId: string;
  page: number;
  pageSize: number;
  sorting: SortingState;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  onSortingChange: (updater: Updater<SortingState>) => void;
}

export function HostIncidentsTable({
  hostId,
  page,
  pageSize,
  sorting,
  onPageChange,
  onPageSizeChange,
  onSortingChange,
}: HostIncidentsTableProps) {
  const params = useGlobalQueryParams(['tenant']);
  const ordering = serializeSorting(sorting);

  const queryParams = useMemo(
    () => ({
      asset: hostId,
      tenant: params.tenant,
      pageIndex: page - 1,
      pageSize,
      ordering,
    }),
    [hostId, params.tenant, page, pageSize, ordering],
  );

  const { data, isFetching } = useGetThreatsStatusQuery(queryParams);

  const results = data?.results ?? [];
  const total = data?.count ?? 0;

  return (
    <div className="space-y-2">
      <Table
        data={results}
        columns={columns}
        isLoading={isFetching}
        sorting={sorting}
        onSortingChange={onSortingChange}
        ExpandedRow={ThreatStatusExpandedRow}
        Empty={
          <DataTableEmpty
            Icon={Biohazard}
            entity="incidents"
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
