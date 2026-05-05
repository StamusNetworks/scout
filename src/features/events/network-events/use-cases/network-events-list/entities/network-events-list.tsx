import { ArrowUpDown } from 'lucide-react';

import { Column } from '@/common/design-system/atoms/layout/column';
import { Row } from '@/common/design-system/atoms/layout/row';
import { Card } from '@/common/design-system/atoms/ui/card';
import { Label as UILabel } from '@/common/design-system/atoms/ui/label';
import { Spin } from '@/common/design-system/atoms/ui/spin';
import { Switch } from '@/common/design-system/atoms/ui/switch';
import { DataTableEmpty } from '@/common/design-system/molecules/data-table/data-table-empty';
import { Pagination } from '@/common/design-system/molecules/pagination';
import { useGetEventsTailQuery } from '@/features/events/common/events.api';
import { useNetworkEventsQfilter } from '@/features/events/hooks/use-network-events-qfilter';
import { Event } from '@/features/events/model/event';
import { useGlobalQueryParams } from '@/features/query-filters/hooks/use-global-query-params';

import { TransactionCard } from '../molecules/transaction-card';

export interface NetworkEventsListProps {
  page: number;
  pageSize: number;
  groupByFlow: boolean;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  onGroupByFlowChange: (groupByFlow: boolean) => void;
}

export const NetworkEventsList = ({
  page,
  pageSize,
  groupByFlow,
  onPageChange,
  onPageSizeChange,
  onGroupByFlowChange,
}: NetworkEventsListProps) => {
  const params = useGlobalQueryParams(['tenant', 'dates']);
  const networkEventsQfilter = useNetworkEventsQfilter();

  const pageIndex = page - 1;

  const { data, totalCount, isFetching } = useGetEventsTailQuery(
    {
      ...params,
      qfilter: networkEventsQfilter,
      ordering: '-timestamp',
      pageIndex,
      pageSize,
    },
    {
      selectFromResult: (result) => ({
        ...result,
        totalCount: result?.data?.count || 0,
        data: (groupByFlow
          ? {
              type: 'grouped' as const,
              data: Object.values(
                result?.data?.results?.reduce(
                  (acc, curr) => {
                    if (acc[curr.flow_id!]) {
                      acc[curr.flow_id!].push(curr);
                    } else {
                      acc[curr.flow_id!] = [curr];
                    }
                    return acc;
                  },
                  {} as Record<string, Event[]>,
                ) || {},
              ),
            }
          : {
              type: 'single' as const,
              data: result?.data?.results ?? [],
            }) satisfies
          | { type: 'single'; data: Event[] }
          | { type: 'grouped'; data: Event[][] },
      }),
    },
  );

  const pageCount = Math.ceil(totalCount / pageSize);

  return (
    <Column className="gap-4">
      <Row className="h-8 justify-between gap-4">
        <Row className="items-center gap-2">
          <UILabel>Group by Flow</UILabel>
          <Switch
            checked={groupByFlow}
            onCheckedChange={onGroupByFlowChange}
          />
        </Row>
      </Row>

      {isFetching ? (
        <Spin />
      ) : data.data.length === 0 ? (
        <DataTableEmpty
          Icon={ArrowUpDown}
          entity="network events"
          className="border"
        />
      ) : data.type === 'grouped' ? (
        <GroupedList data={data.data} />
      ) : data.type === 'single' ? (
        <FlatList data={data.data} />
      ) : null}

      <Pagination
        areSomeRowsSelected={false}
        selectedRowsCount={0}
        rowsCount={totalCount}
        totalCount={totalCount}
        pageSize={pageSize}
        pageIndex={pageIndex}
        onPageSizeChange={onPageSizeChange}
        onPageIndexChange={(newIndex) => onPageChange(newIndex + 1)}
        isPreviousPage={pageIndex > 0}
        isNextPage={pageIndex < pageCount - 1}
        pageCount={pageCount}
      />
    </Column>
  );
};

const FlatList = ({ data }: { data: Event[] }) => (
  <Column className="gap-2">
    {data.map((event, i) => (
      <Card
        key={i}
        className="flex flex-col gap-4 p-3"
      >
        <TransactionCard event={event} />
      </Card>
    ))}
  </Column>
);

const GroupedList = ({ data }: { data: Event[][] }) => (
  <Column className="gap-2">
    {data.map((flowIdEvents, i) => (
      <Card
        key={i}
        className="flex flex-col gap-4 p-3"
      >
        {flowIdEvents.map((event, j) => (
          <TransactionCard
            key={j}
            event={event}
          />
        ))}
      </Card>
    ))}
  </Column>
);
