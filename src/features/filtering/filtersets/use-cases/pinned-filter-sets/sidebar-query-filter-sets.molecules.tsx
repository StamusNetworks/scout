import { useNavigate } from '@tanstack/react-router';
import {
  ArrowUpDown,
  Binary,
  Building2,
  LaptopMinimal,
  LucideIcon,
  PencilRuler,
  X,
} from 'lucide-react';
import { isNil, toPairs } from 'ramda';
import { useState } from 'react';

import { Column } from '@/common/design-system/atoms/layout/column';
import { Grid } from '@/common/design-system/atoms/layout/grid';
import { Row } from '@/common/design-system/atoms/layout/row';
import { Badge } from '@/common/design-system/atoms/ui/badge';
import { Button } from '@/common/design-system/atoms/ui/button';
import { Card } from '@/common/design-system/atoms/ui/card';
import { Checkbox } from '@/common/design-system/atoms/ui/checkbox';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/common/design-system/atoms/ui/popover';
import { Spin } from '@/common/design-system/atoms/ui/spin';
import { useGlobalQueryParams } from '@/common/fetching/useQueryParams';
import { formatNumber } from '@/common/lib/numbers';
import { capitalizeAll } from '@/common/lib/strings';
import { useGetSignaturesQuery } from '@/features/detection-methods/signatures/api/signatures.api';
import {
  useGetEventsCountQuery,
  useGetEventsTailQuery,
} from '@/features/events/common/events.api';
import { useQueryFilterDefinition } from '@/features/filtering/query-filters/hooks/use-filters-definitions';
import { useQFBuilder } from '@/features/filtering/query-filters/hooks/use-qf-builder';
import {
  PersistedFilter,
  QueryFilterState,
} from '@/features/filtering/query-filters/model/query-filter';
import { selectTagFilters } from '@/features/filtering/query-filters/store/query-filters.selector';
import {
  useGetHostsQuery,
  useGetHostsWithAlertsQuery,
} from '@/features/host-insights/common/host-insights.api';
import { useAppSelector } from '@/store/store';

import {
  getFiltersFromFilterSet,
  getTagsFromFilterSet,
  QueryFilterSet,
} from '../../filterset.model';
import { filterSetPageConfig } from '../../filtersets.constants';
import { useIsLoadedFilterSet } from '../../filtersets.store';
import { loadFilterSet } from '../load-filter-set/load-filter-set';

export function FilterSetsHeader({
  children,
}: React.ComponentProps<typeof Row>) {
  return <Row className="items-center justify-between">{children}</Row>;
}

interface FilterSetsTitleProps extends React.ComponentProps<'h3'> {
  title: string;
}
export function FilterSetsTitle({ title, ...props }: FilterSetsTitleProps) {
  return (
    <h3
      className="text-xs"
      {...props}
    >
      {title}
    </h3>
  );
}

interface FilterSetsClearButtonProps extends React.ComponentProps<
  typeof Button
> {
  onClear?: () => void;
}
export function FilterSetsClearButton({
  onClear,
  ...props
}: FilterSetsClearButtonProps) {
  return (
    <Button
      variant="ghost"
      size="xs"
      className="text-muted-foreground"
      onClick={onClear}
      {...props}
    >
      Clear
    </Button>
  );
}

export function FilterSetsItems({
  children,
}: React.ComponentProps<typeof Column>) {
  return <Column className="gap-2">{children}</Column>;
}

interface FilterSetsItemProps extends React.ComponentProps<typeof Card> {
  filterSet: QueryFilterSet;
  onDelete: (id: number) => void;
}
export const FilterSetsItem = ({
  filterSet,
  onDelete,
  ...props
}: FilterSetsItemProps) => {
  const Icon = filterSetPageConfig[filterSet.page].icon;
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const onClickHandler = () => {
    loadFilterSet(filterSet);
    const filters = getFiltersFromFilterSet(filterSet);
    const suffix =
      filterSet.page === 'HOSTS_LIST' &&
      filters?.some((filter) => !filter.id.startsWith('host_id.'))
        ? ''
        : '?with_alerts=false';
    navigate({ to: filterSetPageConfig[filterSet.page].route + suffix });
  };
  const loaded = useIsLoadedFilterSet(filterSet.id);
  return (
    <Popover
      open={open}
      onOpenChange={setOpen}
    >
      <PopoverTrigger
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        asChild
      >
        <Card
          variant={loaded ? 'highlight' : 'base'}
          {...props}
          onClick={onClickHandler}
          className="flex cursor-pointer items-center justify-between rounded-sm p-1 select-none"
        >
          <Column className="gap-1">
            <Row className="gap-1">
              {Icon && <Icon className="shrink-0" />}
              <p className="text-xs">{filterSet.name}</p>
            </Row>
            <Row className="gap-1">
              {filterSet.page === 'HOSTS_LIST' && (
                <>
                  <FilterSetInternalHostsBadge filterSet={filterSet} />
                  <FilterSetHostsBadge filterSet={filterSet} />
                </>
              )}
              {['DASHBOARDS', 'ALERTS_LIST', 'RULES_LIST'].includes(
                filterSet.page,
              ) && (
                <>
                  <FilterSetEventsBadge filterSet={filterSet} />
                  <FilterSetInternalHostsWithEventsBadge
                    filterSet={filterSet}
                  />
                  <FilterSetHostsWithEventsBadge filterSet={filterSet} />
                  <FilterSetDetectionMethodsBadge filterSet={filterSet} />
                </>
              )}

              {filterSet.page === 'SESSION_EVENTS' && (
                <FilterSetTransactionsBadge filterSet={filterSet} />
              )}
            </Row>
          </Column>
          <Button
            variant="ghost"
            size="icon-xs"
            className="text-muted-foreground"
            onClick={() => onDelete(filterSet.id)}
          >
            <X />
          </Button>
        </Card>
      </PopoverTrigger>
      <PopoverContent
        className="w-fit min-w-64 p-2"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <FilterSetsItemPopoverContent filterSet={filterSet} />
      </PopoverContent>
    </Popover>
  );
};

const FilterSetsItemPopoverContent = ({
  filterSet,
}: {
  filterSet: QueryFilterSet;
}) => {
  const tags = getTagsFromFilterSet(filterSet);
  const filters = getFiltersFromFilterSet(filterSet);
  return (
    <Column className="gap-3">
      {tags && (
        <Grid className="grid-cols-3 gap-2">
          {toPairs(tags)
            .filter((value) => !isNil(value))
            .map(([tag, value]) => (
              <Row
                key={tag}
                className="items-center gap-1"
              >
                <Checkbox checked={value} />
                <span className="text-xs">{capitalizeAll(tag)}</span>
              </Row>
            ))}
        </Grid>
      )}
      <Column className="gap-1">
        {filters?.map((filter) => (
          <PopoverQueryFilter
            key={filter.id}
            filter={filter}
          />
        ))}
      </Column>
    </Column>
  );
};

const getFallbackLabel = (filterId: string) => {
  const spaced = filterId.replaceAll('.', ' ').replaceAll('_', ' ');
  return capitalizeAll(spaced);
};
const PopoverQueryFilter = ({ filter }: { filter: PersistedFilter }) => {
  const definition = useQueryFilterDefinition(filter.id);
  return (
    <Column>
      <Row className="justify-between">
        <p className="text-xs font-bold">
          {definition?.label || getFallbackLabel(filter.id)}
        </p>
        <span className="text-muted-foreground text-xs">{filter.id}</span>
      </Row>
      <p className="max-w-80 text-sm break-all">{filter.value}</p>
    </Column>
  );
};

function FilterSetEventsBadge({ filterSet }: { filterSet: QueryFilterSet }) {
  const navigate = useNavigate();
  const params = useFilterSetQueryParams(filterSet);
  const events = useGetEventsCountQuery({
    start_date: params.start_date,
    end_date: params.end_date,
    tenant: params.tenant,
    qfilter: params.qfilter,
    stamus: params.stamus,
    discovery: params.discovery,
    alert: params.alert,
  });
  const onClickHandler = () => {
    loadFilterSet(filterSet);
    navigate({ to: '/detection-events' });
  };
  return (
    <FilterSetBadge
      Icon={Binary}
      count={events.data?.doc_count}
      loading={events.isFetching}
      handleClick={onClickHandler}
    />
  );
}

function FilterSetTransactionsBadge({
  filterSet,
}: {
  filterSet: QueryFilterSet;
}) {
  const navigate = useNavigate();
  const params = useFilterSetQueryParams(filterSet);
  const events = useGetEventsTailQuery({
    start_date: params.start_date,
    end_date: params.end_date,
    tenant: params.tenant,
    qfilter: params.qfilter,
    pageSize: 1,
  });
  const onClickHandler = () => {
    loadFilterSet(filterSet);
    navigate({ to: '/network-events' });
  };
  return (
    <FilterSetBadge
      Icon={ArrowUpDown}
      count={events.data?.count}
      loading={events.isFetching}
      handleClick={onClickHandler}
    />
  );
}

function FilterSetHostsBadge({ filterSet }: { filterSet: QueryFilterSet }) {
  const navigate = useNavigate();
  const params = useFilterSetQueryParams(filterSet);
  const hosts = useGetHostsQuery({
    start_date: params.start_date,
    end_date: params.end_date,
    tenant: params.tenant,
    host_id_qfilter: params.host_id_qfilter,
    pageSize: 1,
  });
  const onClickHandler = () => {
    loadFilterSet(filterSet);
    navigate({ to: '/hosts' as string, search: { with_alerts: false } });
  };
  return (
    <FilterSetBadge
      Icon={LaptopMinimal}
      count={hosts.data?.count}
      loading={hosts.isFetching}
      handleClick={onClickHandler}
    />
  );
}

function FilterSetInternalHostsBadge({
  filterSet,
}: {
  filterSet: QueryFilterSet;
}) {
  const navigate = useNavigate();
  const QFBuilder = useQFBuilder();
  const params = useFilterSetQueryParams(filterSet, [
    QFBuilder.createFilter('host_id.in_home_net', 'true'),
  ]);
  const hosts = useGetHostsQuery({
    start_date: params.start_date,
    end_date: params.end_date,
    tenant: params.tenant,
    host_id_qfilter: params.host_id_qfilter,
    pageSize: 1,
  });
  const onClickHandler = () => {
    loadFilterSet(filterSet);
    navigate({
      to: '/hosts' as string,
      search: { with_alerts: false, in_home_net: 'true' },
    });
  };
  return (
    <FilterSetBadge
      Icon={Building2}
      count={hosts.data?.count}
      loading={hosts.isFetching}
      handleClick={onClickHandler}
    />
  );
}

function FilterSetInternalHostsWithEventsBadge({
  filterSet,
}: {
  filterSet: QueryFilterSet;
}) {
  const navigate = useNavigate();
  const QFBuilder = useQFBuilder();
  const params = useFilterSetQueryParams(filterSet, [
    QFBuilder.createFilter('host_id.in_home_net', 'true'),
  ]);
  const hosts = useGetHostsWithAlertsQuery({
    ...params,
    pageSize: 1,
    highlight: true,
  });
  const onClickHandler = () => {
    loadFilterSet(filterSet);
    navigate({ to: '/hosts' as string, search: { in_home_net: 'true' } });
  };
  return (
    <FilterSetBadge
      Icon={Building2}
      count={hosts.data?.count}
      loading={hosts.isFetching}
      handleClick={onClickHandler}
    />
  );
}

function FilterSetHostsWithEventsBadge({
  filterSet,
}: {
  filterSet: QueryFilterSet;
}) {
  const navigate = useNavigate();
  const params = useFilterSetQueryParams(filterSet);
  const hosts = useGetHostsWithAlertsQuery({
    ...params,
    pageSize: 1,
    highlight: true,
  });
  const onClickHandler = () => {
    loadFilterSet(filterSet);
    navigate({ to: '/hosts' as string });
  };
  return (
    <FilterSetBadge
      Icon={LaptopMinimal}
      count={hosts.data?.count}
      loading={hosts.isFetching}
      handleClick={onClickHandler}
    />
  );
}

function FilterSetDetectionMethodsBadge({
  filterSet,
}: {
  filterSet: QueryFilterSet;
}) {
  const navigate = useNavigate();
  const params = useFilterSetQueryParams(filterSet);
  const detectionMethods = useGetSignaturesQuery({
    start_date: params.start_date,
    end_date: params.end_date,
    tenant: params.tenant,
    qfilter: params.qfilter,
    stamus: params.stamus,
    discovery: params.discovery,
    alert: params.alert,
    pageSize: 1,
    hits_min: 1,
  });
  const onClickHandler = () => {
    loadFilterSet(filterSet);
    navigate({ to: '/detection-methods' });
  };
  return (
    <FilterSetBadge
      Icon={PencilRuler}
      count={detectionMethods.data?.count}
      loading={detectionMethods.isFetching}
      handleClick={onClickHandler}
    />
  );
}

function FilterSetBadge({
  Icon,
  count,
  loading,
  handleClick,
}: {
  Icon: LucideIcon;
  count?: number;
  loading?: boolean;
  handleClick: () => void;
}) {
  return (
    <Badge
      className="w-fit gap-1 px-1"
      variant={count && count > 0 ? 'default' : 'discreet'}
      onClick={(e) => {
        e.stopPropagation();
        handleClick();
      }}
    >
      {Icon && <Icon className="size-4" />}
      {loading ? (
        <Spin className="size-3 animate-spin" />
      ) : (
        formatNumber(count ?? 0)
      )}
      {count === 10000 && '+'}
    </Badge>
  );
}

function mapPersistedToFilterState(
  filter: PersistedFilter,
): Omit<QueryFilterState, 'id'> {
  return {
    key: filter.id,
    value: filter.value,
    is_suspended: false,
    is_negated: filter.negated,
    is_wildcarded: filter.id === 'es_filter' ? false : !filter.fullString,
  };
}

function useFilterSetQueryParams(
  filterSet: QueryFilterSet,
  additionalFilters?: QueryFilterState[],
) {
  const params = useGlobalQueryParams(['tenant', 'dates']);
  const QFBuilder = useQFBuilder();
  const appTags = useAppSelector(selectTagFilters);
  const tags = getTagsFromFilterSet(filterSet);
  const filters = [
    ...(additionalFilters ?? []),
    ...(getFiltersFromFilterSet(filterSet)?.map(mapPersistedToFilterState) ??
      []),
  ];
  return {
    start_date: params.start_date,
    end_date: params.end_date,
    tenant: params.tenant,
    qfilter: QFBuilder.toQFString(filters, {
      untagged: tags?.untagged ?? !!appTags?.untagged,
      relevant: tags?.relevant ?? !!appTags?.relevant,
      informational: tags?.informational ?? !!appTags?.informational,
    }),
    host_id_qfilter: QFBuilder.toHostIdQFString(filters),
    stamus: tags?.stamus ?? !!appTags?.stamus,
    discovery: tags?.sightings ?? !!appTags?.discovery,
    alert: tags?.alerts ?? !!appTags?.alert,
  };
}
