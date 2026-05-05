import { useParams } from '@tanstack/react-router';
import { useMemo } from 'react';

import { DataTable } from '@/common/design-system/molecules/data-table';
import { useServerTableState } from '@/common/design-system/molecules/data-table/hooks/use-server-table-state.ts';
import { useGetEventsQuery } from '@/features/events';
import { getColumns } from '@/features/events';
import { ExpandedEventRow } from '@/features/events';
import { useGlobalQueryParams } from '@/features/query-filters/hooks/use-global-query-params';
import { useQFBuilder } from '@/features/query-filters/hooks/use-qf-builder';

export const FamilyEvents = () => {
  const { familyId } = useParams({ strict: false }) as { familyId: string };
  const columns = useMemo(() => getColumns(true), []);
  const QFBuilder = useQFBuilder();
  const params = useGlobalQueryParams(['tenant', 'dates']);
  const { queryParams, pagination, setPagination, sorting, setSorting } =
    useServerTableState(params);
  const { data, isLoading } = useGetEventsQuery(
    {
      ...queryParams,
      alert: true,
      stamus: true,
      discovery: true,
      qfilter: QFBuilder.toQFString(
        [QFBuilder.createFilter('stamus.family_id', familyId!)],
        { untagged: true, informational: true, relevant: true },
      ),
    },
    { skip: !familyId },
  );
  return (
    <DataTable
      data={data}
      isLoading={isLoading}
      columns={columns}
      pagination={pagination}
      onPaginationChange={setPagination}
      ExpandedRow={ExpandedEventRow}
      sorting={sorting}
      onSortingChange={setSorting}
    />
  );
};
