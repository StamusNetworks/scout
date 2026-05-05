import { DataTable } from '@/common/design-system/molecules/data-table';
import { useServerTableState } from '@/common/design-system/molecules/data-table/hooks/use-server-table-state.ts';
import { useGetEventsQuery } from '@/features/events/common/events.api';
import { getColumns } from '@/features/events/components/events-table/events.columns';
import { ExpandedEventRow } from '@/features/events/components/expanded-event-row/expanded-event-row';
import { useGlobalQueryParams } from '@/features/query-filters/hooks/use-global-query-params';
import { useQFBuilder } from '@/features/query-filters/hooks/use-qf-builder';

const columns = getColumns(true);

type Props = { threatId: string };

export const ThreatEvents = ({ threatId }: Props) => {
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
        [QFBuilder.createFilter('stamus.threat_id', threatId)],
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
