import {
  ArrowUpDown,
  Binary,
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
import { useGlobalQueryParams } from '@/common/fetching/useQueryParams';
import { formatNumber } from '@/common/lib/numbers';
import { capitalizeAll } from '@/common/lib/strings';
import {
  useGetHostsQuery,
  useGetHostsWithAlertsQuery,
} from '@/features/analytics/hosts/api/hosts.api';
import { useGetSignaturesQuery } from '@/features/hunt/detection-methods/signatures/api/signatures.api';
import {
  useGetEventsCountQuery,
  useGetEventsTailQuery,
} from '@/features/hunt/events/api/events.api';
import { useAppSelector } from '@/store/store';

import { filterSetPageConfig } from '../../constants/query-filtersets';
import { useQueryFilterDefinition } from '../../hooks/use-filters-definitions';
import { useQFBuilder } from '../../hooks/use-qf-builder';
import { PersistedFilter, QueryFilterState } from '../../model/query-filter';
import {
  getFiltersFromFilterSet,
  getTagsFromFilterSet,
  QueryFilterSet,
} from '../../model/query-filterset.schema';
import { selectTagFilters } from '../../store/query-filters.selector';

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
  return <Column className="gap-1">{children}</Column>;
}

interface FilterSetsItemProps extends React.ComponentProps<typeof Card> {
  filterSet: QueryFilterSet;
  onDelete: (id: number) => void;
  onClickHandler: (filterSet: QueryFilterSet) => void;
}
export const FilterSetsItem = ({
  filterSet,
  onDelete,
  onClickHandler,
  ...props
}: FilterSetsItemProps) => {
  const Icon = filterSetPageConfig[filterSet.page].icon;
  const [open, setOpen] = useState(false);
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
          {...props}
          onClick={() => onClickHandler(filterSet)}
          className="flex cursor-pointer items-center justify-between rounded-sm p-1 select-none"
        >
          <Column className="gap-1">
            <Row className="gap-1">
              {Icon && <Icon className="shrink-0" />}
              <p className="text-xs">{filterSet.name}</p>
            </Row>
            <Row className="gap-1">
              {filterSet.page === 'HOSTS_LIST' && (
                <FilterSetHostsBadge filterSet={filterSet} />
              )}
              {['DASHBOARDS', 'ALERTS_LIST', 'RULES_LIST'].includes(
                filterSet.page,
              ) && <FilterSetEventsBadge filterSet={filterSet} />}
              {['DASHBOARDS', 'ALERTS_LIST', 'RULES_LIST'].includes(
                filterSet.page,
              ) && <FilterSetHostsWithEventsBadge filterSet={filterSet} />}
              {['DASHBOARDS', 'ALERTS_LIST', 'RULES_LIST'].includes(
                filterSet.page,
              ) && <FilterSetDetectionMethodsBadge filterSet={filterSet} />}
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

const PopoverQueryFilter = ({ filter }: { filter: PersistedFilter }) => {
  const definition = useQueryFilterDefinition(filter.id);
  return (
    <Column>
      <Row className="justify-between">
        <p className="text-xs font-bold">{definition?.label}</p>
        <span className="text-muted-foreground text-xs">{filter.id}</span>
      </Row>
      <p className="text-sm">{filter.value}</p>
    </Column>
  );
};

function FilterSetEventsBadge({ filterSet }: { filterSet: QueryFilterSet }) {
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
  return (
    <FilterSetBadge
      Icon={Binary}
      count={events.data?.doc_count || 0}
    />
  );
}

function FilterSetTransactionsBadge({
  filterSet,
}: {
  filterSet: QueryFilterSet;
}) {
  const params = useFilterSetQueryParams(filterSet);
  const events = useGetEventsTailQuery({
    start_date: params.start_date,
    end_date: params.end_date,
    tenant: params.tenant,
    qfilter: params.qfilter,
    stamus: params.stamus,
    discovery: params.discovery,
    alert: params.alert,
    pageSize: 1,
  });
  return (
    <FilterSetBadge
      Icon={ArrowUpDown}
      count={events.data?.count || 0}
    />
  );
}

function FilterSetHostsBadge({ filterSet }: { filterSet: QueryFilterSet }) {
  const params = useFilterSetQueryParams(filterSet);
  const hosts = useGetHostsQuery({
    start_date: params.start_date,
    end_date: params.end_date,
    tenant: params.tenant,
    host_id_qfilter: params.host_id_qfilter,
    pageSize: 1,
  });
  return (
    <FilterSetBadge
      Icon={LaptopMinimal}
      count={hosts.data?.count || 0}
    />
  );
}

function FilterSetHostsWithEventsBadge({
  filterSet,
}: {
  filterSet: QueryFilterSet;
}) {
  const params = useFilterSetQueryParams(filterSet);
  const hosts = useGetHostsWithAlertsQuery({
    ...params,
    pageSize: 1,
    highlight: true,
  });
  return (
    <FilterSetBadge
      Icon={LaptopMinimal}
      count={hosts.data?.count || 0}
    />
  );
}

function FilterSetDetectionMethodsBadge({
  filterSet,
}: {
  filterSet: QueryFilterSet;
}) {
  const params = useFilterSetQueryParams(filterSet);
  const detectionMethods = useGetSignaturesQuery({
    start_date: params.start_date,
    end_date: params.end_date,
    tenant: params.tenant,
    qfilter: params.qfilter,
    pageSize: 1,
    hits_min: 1,
  });
  return (
    <FilterSetBadge
      Icon={PencilRuler}
      count={detectionMethods.data?.count || 0}
    />
  );
}

function FilterSetBadge({ Icon, count }: { Icon: LucideIcon; count: number }) {
  return (
    <Badge
      className="w-fit gap-1 px-1"
      variant={count > 0 ? 'default' : 'discreet'}
    >
      {Icon && <Icon className="size-4" />}
      {formatNumber(count)}
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
    is_wildcarded: filter.fullString,
  };
}

function useFilterSetQueryParams(filterSet: QueryFilterSet) {
  const params = useGlobalQueryParams(['tenant', 'dates']);
  const QFBuilder = useQFBuilder();
  const appTags = useAppSelector(selectTagFilters);
  const tags = getTagsFromFilterSet(filterSet);
  const filters = getFiltersFromFilterSet(filterSet)?.map(
    mapPersistedToFilterState,
  );
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
