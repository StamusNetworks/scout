import type { SortingState, Updater } from '@tanstack/react-table';
import { PencilRuler } from 'lucide-react';
import { useMemo } from 'react';

import { DataTableEmpty } from '@/common/design-system/molecules/data-table/data-table-empty';
import { serializeSorting } from '@/common/design-system/molecules/data-table/hooks/sorting-parser';
import { PaginationFooter } from '@/common/design-system/molecules/pagination-footer';
import { Table } from '@/common/design-system/molecules/table';
import { useGlobalQueryParams } from '@/common/fetching/useQueryParams';
import { esEscape } from '@/common/lib/strings';
import { useGetSignaturesQuery } from '@/features/detection-methods/detection-methods.api';
import { DETECTION_METHODS_COLUMNS } from '@/features/detection-methods/detection-methods.table';
import { DetectionMethodsExpandedRow } from '@/features/detection-methods/signatures/components/signatures-table/signatures-table.expanded-row';

interface HostDetectionMethodsTableProps {
  hostId: string;
  page: number;
  pageSize: number;
  sorting: SortingState;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  onSortingChange: (updater: Updater<SortingState>) => void;
}

export function HostDetectionMethodsTable({
  hostId,
  page,
  pageSize,
  sorting,
  onPageChange,
  onPageSizeChange,
  onSortingChange,
}: HostDetectionMethodsTableProps) {
  const params = useGlobalQueryParams(['tenant', 'dates']);
  const ordering = serializeSorting(sorting);

  const queryParams = useMemo(
    () => ({
      ...params,
      host_id_qfilter: `ip:"${esEscape(hostId ?? '')}"`,
      ordering: ordering ?? '-hits',
      hits_min: 1,
      alert: true,
      stamus: true,
      pageIndex: page - 1,
      pageSize,
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

  const { data, isFetching } = useGetSignaturesQuery(queryParams);

  const results = data?.results ?? [];
  const total = data?.count ?? 0;

  return (
    <div className="space-y-2">
      <Table
        data={results}
        columns={DETECTION_METHODS_COLUMNS}
        isLoading={isFetching}
        sorting={sorting}
        onSortingChange={onSortingChange}
        ExpandedRow={DetectionMethodsExpandedRow}
        getRowId={(row) => row.pk?.toString()}
        Empty={
          <DataTableEmpty
            Icon={PencilRuler}
            entity="detection methods"
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
