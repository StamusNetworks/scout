import { useParams } from '@tanstack/react-router';

import { DataTable } from '@/common/design-system/molecules/data-table';
import { useServerTableState } from '@/common/design-system/molecules/data-table/hooks/use-server-table-state.ts';
import { useGlobalQueryParams } from '@/common/fetching/useQueryParams';
import { useGetEventsQuery } from '@/features/hunt/events/api/events.api';
import { getColumns } from '@/features/hunt/events/components/events-table/events.columns';
import { ExpandedEventRow } from '@/features/hunt/events/components/events-table/events.expanded-row';
import { useQFBuilder } from '@/features/hunt/filtering/query-filters/hooks/use-qf-builder';

const columns = getColumns(true);

export const ThreatByIdEvents = () => {
  const { threatId } = useParams({ strict: false }) as { threatId: string };
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
        [QFBuilder.createFilter('stamus.threat_id', threatId!)],
        { untagged: true, informational: true, relevant: true },
      ),
    },
    { skip: !threatId },
  );

  return (
    <DataTable
      data={data}
      isLoading={isLoading}
      columns={columns}
      pagination={pagination}
      onPaginationChange={setPagination}
      sorting={sorting}
      onSortingChange={setSorting}
      ExpandedRow={ExpandedEventRow}
    />
  );
};
