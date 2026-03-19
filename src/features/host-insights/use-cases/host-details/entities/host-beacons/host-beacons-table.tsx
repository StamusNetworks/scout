import type { SortingState, Updater } from '@tanstack/react-table';
import { Radar } from 'lucide-react';
import { useMemo } from 'react';

import { DataTableEmpty } from '@/common/design-system/molecules/data-table/data-table-empty';
import { serializeSorting } from '@/common/design-system/molecules/data-table/hooks/sorting-parser';
import { PaginationFooter } from '@/common/design-system/molecules/pagination-footer';
import { Table } from '@/common/design-system/molecules/table';
import { esEscape } from '@/common/lib/strings';
import { useGetBeaconingEventsQuery } from '@/features/events/beaconing/common/beaconing.api';
import { beaconingTableColumns } from '@/features/events/beaconing/common/molecules/beaconing-table';
import { useGlobalQueryParams } from '@/features/filtering/use-global-query-params';

interface HostBeaconsTableProps {
  hostId: string;
  page: number;
  pageSize: number;
  sorting: SortingState;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  onSortingChange: (updater: Updater<SortingState>) => void;
}

export function HostBeaconsTable({
  hostId,
  page,
  pageSize,
  sorting,
  onPageChange,
  onPageSizeChange,
  onSortingChange,
}: HostBeaconsTableProps) {
  const params = useGlobalQueryParams(['tenant', 'dates']);
  const ordering = serializeSorting(sorting);

  const queryParams = useMemo(
    () => ({
      ...params,
      qfilter: `beacon_report.assets:${esEscape(hostId ?? '')}`,
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

  const { data, isFetching } = useGetBeaconingEventsQuery(queryParams);

  const results = data?.results ?? [];
  const total = data?.count ?? 0;

  return (
    <div className="space-y-2">
      <Table
        data={results}
        columns={beaconingTableColumns}
        isLoading={isFetching}
        sorting={sorting}
        onSortingChange={onSortingChange}
        Empty={
          <DataTableEmpty
            Icon={Radar}
            entity="beacons"
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
