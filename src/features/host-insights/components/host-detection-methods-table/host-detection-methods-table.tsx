import type { SortingState, Updater } from '@tanstack/react-table';
import { PencilRuler } from 'lucide-react';
import { useMemo } from 'react';

import { DataTableEmpty } from '@/common/design-system/molecules/data-table/data-table-empty';
import { serializeSorting } from '@/common/design-system/molecules/data-table/hooks/sorting-parser';
import { PaginationFooter } from '@/common/design-system/molecules/pagination-footer';
import { Table } from '@/common/design-system/molecules/table';
import { esEscape } from '@/common/lib/strings';
import { useGlobalQueryParams } from '@/features/query-filters/hooks/use-global-query-params';
import {
  RuleExpandedRow,
  rulesTableColumns,
  useGetRulesQuery,
} from '@/features/rules';

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
      page,
      pageSize,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [hostId, params.tenant, params.from, params.to, page, pageSize, ordering],
  );

  const { data, isFetching } = useGetRulesQuery(queryParams);

  const results = data?.results ?? [];
  const total = data?.count ?? 0;

  return (
    <div className="space-y-2">
      <Table
        data={results}
        columns={rulesTableColumns}
        isLoading={isFetching}
        sorting={sorting}
        onSortingChange={onSortingChange}
        ExpandedRow={RuleExpandedRow}
        getRowId={(row) => row.id?.toString()}
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
