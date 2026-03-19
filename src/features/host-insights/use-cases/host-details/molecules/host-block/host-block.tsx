import { format } from 'date-fns';
import { LaptopMinimal, LucideIcon } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';

import { Column } from '@/common/design-system/atoms/layout/column';
import { Grid } from '@/common/design-system/atoms/layout/grid';
import { Row } from '@/common/design-system/atoms/layout/row';
import { Badge } from '@/common/design-system/atoms/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/common/design-system/atoms/ui/popover';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/common/design-system/atoms/ui/tooltip';
import {
  ComposablePagination,
  ItemsCount,
  PageSelector,
} from '@/common/design-system/molecules/pagination';
import { TableCard } from '@/common/design-system/molecules/table-card';
import { selectDates } from '@/features/filtering/dates/dates.selectors';
import { EventValue } from '@/features/filtering/query-filters/components/event-value/event-value';

import { useValuesSortParam } from './use-values-sort-param';

function formatForExport(data: HostBlockItem[] | undefined) {
  if (!data) return [];
  return data.map((item) => ({
    value: item.value,
    start: new Date(item.first_seen).toISOString(),
    end: new Date(item.last_seen).toISOString(),
  }));
}

const pageSize = 5;

export const HostBlock = ({
  title,
  data,
  filterId,
  type,
  Icon = LaptopMinimal,
}: {
  title: string;
  data: HostBlockItem[] | undefined;
  filterId: string;
  type: 'default' | 'expandable';
  Icon?: LucideIcon;
}) => {
  const [sort] = useValuesSortParam();
  const datesFilter = useSelector(selectDates);
  const [fallbackEndDate] = useState(() => Date.now());
  const start_date = datesFilter.start_date ?? 0;
  const end_date = datesFilter.end_date ?? fallbackEndDate;
  const [pageIndex, setPageIndex] = useState(0);

  const sortedData = useMemo(() => {
    const copy = [...(data || [])];
    return copy.sort((a, b) => {
      switch (sort) {
        case 'first-seen-asc':
          return a.first_seen - b.first_seen;
        case 'first-seen-desc':
          return b.first_seen - a.first_seen;
        case 'last-seen-asc':
          return a.last_seen - b.last_seen;
        case 'last-seen-desc':
        default:
          return b.last_seen - a.last_seen;
      }
    });
  }, [data, sort]);

  const displayData = useMemo(() => {
    return sortedData?.slice(pageIndex * pageSize, (pageIndex + 1) * pageSize);
  }, [sortedData, pageIndex]);

  return (
    <TableCard
      title={title}
      Icon={Icon}
      className={data?.length ? '' : 'opacity-50'}
      headers={[title.slice(0, title.indexOf(' (')), 'start', 'end']}
      data={formatForExport(data)}
    >
      <Column className="h-48 justify-between">
        <div>
          <Grid className="w-full grid-cols-5 gap-2">
            <div className="col-span-3" />
            <Row className="col-span-2 mb-1 justify-between">
              <Row className="items-end gap-1">
                <span className="bg-foreground/50 h-2 w-0.5" />
                <span className="text-xs">
                  {format(new Date(start_date), 'MMM do yyyy')}
                </span>
              </Row>
              <Row className="items-end gap-1">
                <span className="text-right text-xs">
                  {format(new Date(end_date), 'MMM do yyyy')}
                </span>
                <span className="bg-foreground/50 h-2 w-0.5" />
              </Row>
            </Row>
          </Grid>
          <Column className="gap-1">
            {displayData.map((item, index) =>
              type === 'default' ? (
                <HostBlockRow
                  key={index}
                  item={item}
                  startDate={start_date}
                  endDate={end_date}
                  filterId={filterId}
                />
              ) : type === 'expandable' ? (
                <HostBlockExpandableRow
                  key={index}
                  item={item}
                  startDate={start_date}
                  endDate={end_date}
                  filterId={filterId}
                />
              ) : null,
            )}
            {!data?.length && (
              <div className="mt-2 text-center">
                <p className="text-sm text-gray-500">No captured values.</p>
              </div>
            )}
          </Column>
        </div>
        <div className="mt-2">
          <ComposablePagination
            areSomeRowsSelected={false}
            selectedRowsCount={0}
            rowsCount={data?.length ?? 0}
            totalCount={data?.length ?? 0}
            pageSize={pageSize}
            pageIndex={pageIndex}
            onPageSizeChange={() => {}}
            onPageIndexChange={setPageIndex}
            isPreviousPage={pageIndex > 0}
            isNextPage={
              pageIndex < Math.ceil((data?.length ?? 0) / pageSize) - 1
            }
            pageCount={Math.ceil((data?.length ?? 0) / pageSize)}
            className="px-0"
          >
            <ItemsCount />
            <PageSelector />
          </ComposablePagination>
        </div>
      </Column>
    </TableCard>
  );
};

interface HostBlockItem {
  first_seen: number;
  last_seen: number;
  value: string;
  prefix?: string;
  expandedItems?: {
    key: string;
    value: string | number;
    filter?: string;
  }[];
}

interface HostBlockRowProps {
  item: HostBlockItem;
  startDate: number;
  endDate: number;
  filterId: string;
}

const HostBlockRow = ({
  item,
  startDate,
  endDate,
  filterId,
}: HostBlockRowProps) => {
  return (
    <Grid className="grid-cols-5 gap-2">
      <div className="col-span-3 text-sm">
        <EventValue
          query_key={filterId}
          value={item.value}
        />
      </div>
      <div className="col-span-2">
        <HostBlockBar
          item={item}
          startDate={startDate}
          endDate={endDate}
        />
      </div>
    </Grid>
  );
};

const HostBlockExpandableRow = ({
  item,
  startDate,
  endDate,
  filterId,
}: HostBlockRowProps) => {
  return (
    <Column>
      <Popover>
        <Grid className="grid-cols-5 gap-2">
          <PopoverTrigger asChild>
            <Row className="col-span-3 cursor-pointer gap-1">
              <Badge className="px-1.5 py-0.25">{item.prefix}</Badge>
              <span className="overflow-hidden text-sm text-nowrap text-ellipsis">
                {item.value}
              </span>
            </Row>
          </PopoverTrigger>
          <div className="col-span-2">
            <HostBlockBar
              item={item}
              startDate={startDate}
              endDate={endDate}
            />
          </div>
        </Grid>
        <PopoverContent className="flex min-w-128">
          <Column className="w-full">
            {item.expandedItems?.map((child, index) => (
              <Grid
                className="grid-cols-4"
                key={index}
              >
                <div className="col-span-1 text-sm font-medium">
                  {child.key}
                </div>
                <div className="col-span-3 text-sm">
                  {['first_seen', 'last_seen'].includes(child.key) ? (
                    format(new Date(child.value), 'yyyy-MM-dd HH:mm:ss')
                  ) : (
                    <EventValue
                      query_key={child.filter || filterId}
                      value={child.value}
                      className="line-clamp-3 text-wrap wrap-break-word"
                    />
                  )}
                </div>
              </Grid>
            ))}
          </Column>
        </PopoverContent>
      </Popover>
    </Column>
  );
};

interface HostBlockBarProps {
  item: {
    first_seen: number;
    last_seen: number;
  };
  startDate: number;
  endDate: number;
}

const HostBlockBar = ({ item, startDate, endDate }: HostBlockBarProps) => {
  const start = item.first_seen < startDate ? startDate : item.first_seen;
  const end = item.last_seen > endDate ? endDate : item.last_seen;
  const duration = endDate - startDate;

  const startPercentage = ((start - startDate) / duration) * 100;
  const widthPercentage = ((end - start) / duration) * 100;

  const rangeBounds = getInBounds(
    item.first_seen,
    item.last_seen,
    startDate,
    endDate,
  );

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="bg-primary/10 relative h-full w-full overflow-hidden">
            {rangeBounds === 'started_after' ? (
              <OutOfBounds
                date={item.first_seen}
                isBefore={false}
              />
            ) : rangeBounds === 'ended_before' ? (
              <OutOfBounds
                date={item.last_seen}
                isBefore={true}
              />
            ) : (
              <>
                <div
                  className="bg-primary absolute z-10 h-full"
                  style={{
                    minWidth: '1px',
                    width: `${widthPercentage}%`,
                    left: `${startPercentage}%`,
                  }}
                />
                {rangeBounds === 'started_before' && (
                  <div className="bg-primary to-card absolute left-0 z-20 h-full w-1 bg-linear-to-l from-transparent" />
                )}
                {rangeBounds === 'ended_after' && (
                  <div className="bg-primary to-card absolute right-0 z-20 h-full w-1 bg-linear-to-r from-transparent" />
                )}
              </>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent className="flex flex-col gap-1">
          <div className="text-xs">
            First seen:{' '}
            {format(new Date(item.first_seen), 'yyyy-MM-dd HH:mm:ss')}
          </div>
          <div className="text-xs">
            Last seen: {format(new Date(item.last_seen), 'yyyy-MM-dd HH:mm:ss')}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

const getInBounds = (
  first_seen: number,
  last_seen: number,
  start: number,
  end: number,
):
  | 'whole'
  | 'started_before'
  | 'ended_before'
  | 'started_after'
  | 'ended_after'
  | 'in_bounds' => {
  if (first_seen < start && last_seen > end) {
    return 'whole';
  }
  if (last_seen < start) {
    return 'ended_before';
  }
  if (first_seen > end) {
    return 'started_after';
  }
  if (first_seen < start) {
    return 'started_before';
  }
  if (last_seen > end) {
    return 'ended_after';
  }
  return 'in_bounds';
};

const OutOfBounds = ({
  date,
  isBefore,
}: {
  date: number;
  isBefore: boolean;
}) => (
  <Row className="border-primary bg-muted absolute inset-0 items-center border pl-1 text-xs">
    {isBefore ? 'Ended on ' : 'Started on '}
    {format(new Date(date), 'MMM do yyyy')}
  </Row>
);
