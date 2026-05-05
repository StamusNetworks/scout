import { useMemo } from 'react';
import { useSelector } from 'react-redux';

import { Column } from '@/common/design-system/atoms/layout/column';
import { AlertDialog } from '@/common/design-system/molecules/alert-dialog';
import { SideBarHeader } from '@/features/query-filters/use-cases/list-filters/filters-sidebar';
import { RootState } from '@/store/store';
import { store } from '@/store/store-instance';

import {
  clearFilterSets,
  removeFilterSet,
  selectFilterSets,
} from '../../filter-sets.store';
import {
  FilterSetsClearButton,
  FilterSetsHeader,
  FilterSetsItem,
  FilterSetsItems,
  FilterSetsTitle,
} from './sidebar-query-filter-sets.molecules';

const handleClearFavorites = () => {
  store.dispatch(clearFilterSets('favorites'));
};
const handleClearPinned = () => {
  store.dispatch(clearFilterSets('pinned'));
};
const handleDeleteFilterSetFromFavorites = (id: number) => {
  store.dispatch(removeFilterSet({ key: 'favorites', id }));
};
const handleDeleteFilterSetFromPinned = (id: number) => {
  store.dispatch(removeFilterSet({ key: 'pinned', id }));
};

export const SideBarQueryFilterSets = () => {
  const favorites = useSelector((state: RootState) =>
    selectFilterSets(state, 'favorites'),
  );
  const pinned = useSelector((state: RootState) =>
    selectFilterSets(state, 'pinned'),
  );
  const sortedFavorites = useMemo(
    () => [...favorites].toSorted((a, b) => a.name.localeCompare(b.name)),
    [favorites],
  );
  const sortedPinned = useMemo(
    () => [...pinned].toSorted((a, b) => a.name.localeCompare(b.name)),
    [pinned],
  );
  return (
    <Column>
      <SideBarHeader>Filter Sets</SideBarHeader>
      <Column className="gap-2">
        <Column>
          <FilterSetsHeader>
            <FilterSetsTitle title="Favorites" />
            <AlertDialog
              trigger={<FilterSetsClearButton />}
              onConfirm={handleClearFavorites}
            />
          </FilterSetsHeader>
          <FilterSetsItems>
            {sortedFavorites.map((filterSet) => (
              <FilterSetsItem
                key={filterSet.id}
                filterSet={filterSet}
                onDelete={handleDeleteFilterSetFromFavorites}
              />
            ))}
          </FilterSetsItems>
        </Column>
        <Column>
          <FilterSetsHeader>
            <FilterSetsTitle title="Pinned" />
            <FilterSetsClearButton onClear={handleClearPinned} />
          </FilterSetsHeader>
          <FilterSetsItems>
            {sortedPinned.map((filterSet) => (
              <FilterSetsItem
                key={filterSet.id}
                filterSet={filterSet}
                onDelete={handleDeleteFilterSetFromPinned}
              />
            ))}
          </FilterSetsItems>
        </Column>
      </Column>
    </Column>
  );
};
