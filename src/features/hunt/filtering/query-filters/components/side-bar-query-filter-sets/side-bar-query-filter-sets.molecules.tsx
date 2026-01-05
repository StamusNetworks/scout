import { X } from 'lucide-react';
import { toPairs } from 'ramda';
import { useState } from 'react';

import { Column } from '@/common/design-system/atoms/layout/column';
import { Grid } from '@/common/design-system/atoms/layout/grid';
import { Row } from '@/common/design-system/atoms/layout/row';
import { Button } from '@/common/design-system/atoms/ui/button';
import { Card } from '@/common/design-system/atoms/ui/card';
import { Checkbox } from '@/common/design-system/atoms/ui/checkbox';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/common/design-system/atoms/ui/popover';
import { capitalizeAll } from '@/common/lib/strings';

import { filterSetPageConfig } from '../../constants/query-filtersets';
import { useQueryFilterDefinition } from '../../hooks/use-filters-definitions';
import { QueryFilterSet } from '../../model/query-filterset.schema';
import { TagFilters } from '../../store/query-filters.slice';

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
          <Column>
            <Row className="gap-1">
              {Icon && <Icon className="shrink-0" />}
              <p className="text-xs">{filterSet.name}</p>
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
  const tags = filterSet.content.find((item) => item.id === 'alert.tag')
    ?.value as unknown as TagFilters;
  const filters = filterSet.content.filter(
    (item) => item.id !== 'alert.tag',
  ) as {
    value: string;
    id: string;
    label: string;
    negated: boolean;
    fullString: boolean;
    query?: string | undefined;
  }[];
  return (
    <Column className="gap-3">
      {tags && (
        <Grid className="grid-cols-3 gap-2">
          {toPairs(tags).map(([tag, value]) => (
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
        {filters.map((filter) => (
          <PopoverQueryFilter
            key={filter.id}
            filter={filter}
          />
        ))}
      </Column>
    </Column>
  );
};

const PopoverQueryFilter = ({
  filter,
}: {
  filter: {
    value: string;
    id: string;
    label: string;
    negated: boolean;
    fullString: boolean;
    query?: string | undefined;
  };
}) => {
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
