import type { SortingState, Updater } from '@tanstack/react-table';
import { Radar } from 'lucide-react';
import { useMemo } from 'react';

import { DataTableEmpty } from '@/common/design-system/molecules/data-table/data-table-empty';
import { serializeSorting } from '@/common/design-system/molecules/data-table/hooks/sorting-parser';
import { PaginationFooter } from '@/common/design-system/molecules/pagination-footer';
import { Table } from '@/common/design-system/molecules/table';
import { esEscape } from '@/common/lib/strings';
import { ExpandedEventRow } from '@/features/events/common/molecules/expanded-event-row';
import { useGetSightingEventsQuery } from '@/features/events/sightings/common/sightings.api';
import { hostSightingTableColumns } from '@/features/events/sightings/use-cases/sightings-list/sightings-list.table';
import { useGlobalQueryParams } from '@/features/query-filters/hooks/use-global-query-params';

interface HostSightingsTableProps {
  hostId: string;
  page: number;
  pageSize: number;
  sorting: SortingState;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  onSortingChange: (updater: Updater<SortingState>) => void;
}

export function HostSightingsTable({
  hostId,
  page,
  pageSize,
  sorting,
  onPageChange,
  onPageSizeChange,
  onSortingChange,
}: HostSightingsTableProps) {
  const params = useGlobalQueryParams(['tenant', 'dates']);
  const ordering = serializeSorting(sorting);

  const queryParams = useMemo(
    () => ({
      ...params,
      qfilter: `discovery.asset:${esEscape(hostId ?? '')}`,
      pageIndex: page - 1,
      pageSize,
      ordering,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      hostId,
      params.tenant,
      params.start_date,
      params.end_date,
      page,
      pageSize,
      ordering,
    ],
  );

  const { data, isFetching } = useGetSightingEventsQuery(queryParams);

  const results = data?.results ?? [];
  const total = data?.count ?? 0;

  return (
    <div className="space-y-2">
      <Table
        data={results}
        columns={hostSightingTableColumns}
        isLoading={isFetching}
        sorting={sorting}
        onSortingChange={onSortingChange}
        ExpandedRow={ExpandedEventRow}
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
