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
import { useMemo, useState } from 'react';

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
import { formatNumber } from '@/common/lib/numbers';
import { capitalizeAll } from '@/common/lib/strings';
import { useGetSignaturesQuery } from '@/features/detection-methods/signatures/api/signatures.api';
import {
  useGetEventsCountQuery,
  useGetEventsTailQuery,
} from '@/features/events';
import {
  useGetHostsQuery,
  useGetHostsWithAlertsQuery,
} from '@/features/host-insights/common/host-insights.api';
import {
  type PersistedFilter,
  type QueryFilterState,
  useGatedFilterFlags,
  useGlobalQueryParams,
  useQFBuilder,
  useQueryFilterDefinition,
} from '@/features/query-filters';

import { filterSetPageConfig } from '../../definitions/filter-sets.constants';
import { useIsLoadedFilterSet } from '../../hooks/use-is-loaded-filter-set';
import { useLoadFilterSet } from '../../hooks/use-load-filter-set';
import { type FilterSet } from '../../model/filter-set';

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
  filterSet: FilterSet;
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
  const loadFilterSet = useLoadFilterSet();
  const onClickHandler = () => {
    loadFilterSet(filterSet);
    const suffix =
      filterSet.page === 'HOSTS_LIST' &&
      filterSet.filters.some((filter) => !filter.id.startsWith('host_id.'))
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
  filterSet: FilterSet;
}) => {
  return (
    <Column className="gap-3">
      {filterSet.tags && (
        <Grid className="grid-cols-3 gap-2">
          {toPairs(filterSet.tags)
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
        {filterSet.filters.map((filter) => (
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

/**
 * Returns an onClick handler that loads the filter set into live state
 * and navigates to the given route. Used by every sidebar badge.
 */
function useFilterSetClickHandler(
  filterSet: FilterSet,
  target: { to: string; search?: Record<string, unknown> },
) {
  const navigate = useNavigate();
  const loadFilterSet = useLoadFilterSet();
  return () => {
    loadFilterSet(filterSet);
    // The router's typed `navigate` rejects untyped search params; the
    // legacy routes here predate full typing so cast through `unknown`.
    navigate(target as Parameters<typeof navigate>[0]);
  };
}

function FilterSetEventsBadge({ filterSet }: { filterSet: FilterSet }) {
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
  const onClick = useFilterSetClickHandler(filterSet, {
    to: '/detection-events',
  });
  return (
    <FilterSetBadge
      Icon={Binary}
      count={events.data?.doc_count}
      loading={events.isFetching}
      handleClick={onClick}
    />
  );
}

function FilterSetTransactionsBadge({ filterSet }: { filterSet: FilterSet }) {
  const params = useFilterSetQueryParams(filterSet);
  const events = useGetEventsTailQuery({
    start_date: params.start_date,
    end_date: params.end_date,
    tenant: params.tenant,
    qfilter: params.qfilter,
    pageSize: 1,
  });
  const onClick = useFilterSetClickHandler(filterSet, {
    to: '/network-events',
  });
  return (
    <FilterSetBadge
      Icon={ArrowUpDown}
      count={events.data?.count}
      loading={events.isFetching}
      handleClick={onClick}
    />
  );
}

function FilterSetHostsBadge({ filterSet }: { filterSet: FilterSet }) {
  const params = useFilterSetQueryParams(filterSet);
  const hosts = useGetHostsQuery({
    start_date: params.start_date,
    end_date: params.end_date,
    tenant: params.tenant,
    host_id_qfilter: params.host_id_qfilter,
    pageSize: 1,
  });
  const onClick = useFilterSetClickHandler(filterSet, {
    to: '/hosts' as string,
    search: { with_alerts: false },
  });
  return (
    <FilterSetBadge
      Icon={LaptopMinimal}
      count={hosts.data?.count}
      loading={hosts.isFetching}
      handleClick={onClick}
    />
  );
}

function FilterSetInternalHostsBadge({ filterSet }: { filterSet: FilterSet }) {
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
  const onClick = useFilterSetClickHandler(filterSet, {
    to: '/hosts' as string,
    search: { with_alerts: false, in_home_net: 'true' },
  });
  return (
    <FilterSetBadge
      Icon={Building2}
      count={hosts.data?.count}
      loading={hosts.isFetching}
      handleClick={onClick}
    />
  );
}

function FilterSetInternalHostsWithEventsBadge({
  filterSet,
}: {
  filterSet: FilterSet;
}) {
  const QFBuilder = useQFBuilder();
  const params = useFilterSetQueryParams(filterSet, [
    QFBuilder.createFilter('host_id.in_home_net', 'true'),
  ]);
  const hosts = useGetHostsWithAlertsQuery({
    ...params,
    pageSize: 1,
    highlight: true,
  });
  const onClick = useFilterSetClickHandler(filterSet, {
    to: '/hosts' as string,
    search: { in_home_net: 'true' },
  });
  return (
    <FilterSetBadge
      Icon={Building2}
      count={hosts.data?.count}
      loading={hosts.isFetching}
      handleClick={onClick}
    />
  );
}

function FilterSetHostsWithEventsBadge({
  filterSet,
}: {
  filterSet: FilterSet;
}) {
  const params = useFilterSetQueryParams(filterSet);
  const hosts = useGetHostsWithAlertsQuery({
    ...params,
    pageSize: 1,
    highlight: true,
  });
  const onClick = useFilterSetClickHandler(filterSet, {
    to: '/hosts' as string,
  });
  return (
    <FilterSetBadge
      Icon={LaptopMinimal}
      count={hosts.data?.count}
      loading={hosts.isFetching}
      handleClick={onClick}
    />
  );
}

function FilterSetDetectionMethodsBadge({
  filterSet,
}: {
  filterSet: FilterSet;
}) {
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
  const onClick = useFilterSetClickHandler(filterSet, {
    to: '/detection-methods',
  });
  return (
    <FilterSetBadge
      Icon={PencilRuler}
      count={detectionMethods.data?.count}
      loading={detectionMethods.isFetching}
      handleClick={onClick}
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
    isSuspended: false,
    isNegated: filter.negated,
    isWildcarded: filter.id === 'es_filter' ? false : !filter.fullString,
  };
}

function useFilterSetQueryParams(
  filterSet: FilterSet,
  additionalFilters?: QueryFilterState[],
) {
  const params = useGlobalQueryParams(['tenant', 'dates']);
  const QFBuilder = useQFBuilder();
  const appFlags = useGatedFilterFlags();

  // Memoize the params object — every consuming RTK Query treats this
  // as the cache key, so a fresh literal each render would defeat the
  // cache. Identity changes only when the inputs (filterSet, dates,
  // tenant, app flags, additionalFilters, builder) actually change.
  return useMemo(() => {
    const setTags = filterSet.tags;
    const filters = [
      ...(additionalFilters ?? []),
      ...filterSet.filters.map(mapPersistedToFilterState),
    ];
    return {
      start_date: params.start_date,
      end_date: params.end_date,
      tenant: params.tenant,
      qfilter: QFBuilder.toQFString(filters, {
        untagged: setTags?.untagged ?? !!appFlags?.alertTags.untagged,
        relevant: setTags?.relevant ?? !!appFlags?.alertTags.relevant,
        informational:
          setTags?.informational ?? !!appFlags?.alertTags.informational,
      }),
      host_id_qfilter: QFBuilder.toHostIdQFString(filters),
      stamus: setTags?.stamus ?? !!appFlags?.eventTypes.stamus,
      discovery: setTags?.discovery ?? !!appFlags?.eventTypes.discovery,
      alert: setTags?.alert ?? !!appFlags?.eventTypes.alert,
    };
  }, [
    filterSet,
    additionalFilters,
    params.start_date,
    params.end_date,
    params.tenant,
    appFlags,
    QFBuilder,
  ]);
}
