import { useParams } from '@tanstack/react-router';

import { DataTable } from '@/common/design-system/molecules/data-table';
import { useServerTableState } from '@/common/design-system/molecules/data-table/hooks/use-server-table-state.ts';
import { useGlobalQueryParams } from '@/common/fetching/useQueryParams';
import { useGetEventsQuery } from '@/features/events/common/events.api';
import { ExpandedEventRow } from '@/features/events/common/molecules/expanded-event-row';
import { useQFBuilder } from '@/features/filtering/query-filters/hooks/use-qf-builder';
import { getColumns } from '@/features/hunt/events/components/events-table/events.columns';

const columns = getColumns(true);

export const ThreatFamilyEvents = () => {
  const { familyId } = useParams({ strict: false }) as { familyId: string };
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
