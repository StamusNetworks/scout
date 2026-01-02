import { X } from 'lucide-react';
import { toPairs } from 'ramda';
import { useState } from 'react';
import { useSelector } from 'react-redux';

import { store } from '@/app/App';
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
import { handleLoadFilterSet } from '@/pages/filter-sets';
import { RootState } from '@/store/store';

import { filterSetPageConfig } from '../../constants/query-filtersets';
import { useQueryFilterDefinition } from '../../hooks/use-filters-definitions';
import { QueryFilterSet } from '../../model/query-filterset.schema';
import { TagFilters } from '../../store/query-filters.slice';
import {
  clearQueryFilterSets,
  removeQueryFilterSet,
  selectQueryFilterSets,
} from '../../store/query-filters-sets.slice';
import { SideBarHeader } from '../filters-side-bar';

const handleClearFavorites = () => {
  store.dispatch(clearQueryFilterSets('favorites'));
};
const handleClearPinned = () => {
  store.dispatch(clearQueryFilterSets('pinned'));
};
const handleDeleteFilterSetFromFavorites = (id: number) => {
  store.dispatch(removeQueryFilterSet({ key: 'favorites', id }));
};
const handleDeleteFilterSetFromPinned = (id: number) => {
  store.dispatch(removeQueryFilterSet({ key: 'pinned', id }));
};

export const SideBarQueryFilterSets = () => {
  const favorites = useSelector((state: RootState) =>
    selectQueryFilterSets(state, 'favorites'),
  );
  const pinned = useSelector((state: RootState) =>
    selectQueryFilterSets(state, 'pinned'),
  );
  return (
    <Column>
      <SideBarHeader>Filter Sets</SideBarHeader>
      <Column className="gap-2">
        <QueryFilterSetsCategory
          title="Favorites"
          filterSets={favorites}
          onClear={handleClearFavorites}
          onDelete={handleDeleteFilterSetFromFavorites}
          onClick={handleLoadFilterSet}
        />
        <QueryFilterSetsCategory
          title="Pinned"
          filterSets={pinned}
          onClear={handleClearPinned}
          onDelete={handleDeleteFilterSetFromPinned}
          onClick={handleLoadFilterSet}
        />
      </Column>
    </Column>
  );
};

export const QueryFilterSetsCategory = ({
  title,
  filterSets,
  onClick,
  onClear,
  onDelete,
}: {
  title: string;
  filterSets: QueryFilterSet[];
  onClick: (filterSet: QueryFilterSet) => void;
  onClear: () => void;
  onDelete: (id: number) => void;
}) => (
  <Column>
    <Row className="items-center justify-between">
      <h3 className="text-xs">{title}</h3>
      <Button
        variant="ghost"
        size="xs"
        className="text-muted-foreground"
        onClick={onClear}
      >
        Clear
      </Button>
    </Row>
    <Column className="gap-1">
      {filterSets.map((filterSet) => (
        <QueryFilterSetsItem
          key={filterSet.id}
          filterSet={filterSet}
          onDelete={onDelete}
          onClick={onClick}
        />
      ))}
    </Column>
  </Column>
);

export const QueryFilterSetsItem = ({
  filterSet,
  onDelete,
  onClick,
}: {
  filterSet: QueryFilterSet;
  onDelete: (id: number) => void;
  onClick: (filterSet: QueryFilterSet) => void;
}) => {
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
          onClick={() => onClick(filterSet)}
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
        <QueryFilterSetsItemPopoverContent filterSet={filterSet} />
      </PopoverContent>
    </Popover>
  );
};

const QueryFilterSetsItemPopoverContent = ({
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
